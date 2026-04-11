import os
from sqlalchemy.orm import Session
from sqlalchemy import text, func, and_, cast, Date as SQLDate
from groq import Groq
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv(), override=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY missing from .env")

client = Groq(api_key=GROQ_API_KEY)


def _fetch_analytics(db: Session):
    """
    Compute all advanced analytics in one shot.
    Returns a dict with: summary_stats, category_breakdown, top_employees,
    daily_trend, hourly_distribution, productivity_score.
    """
    today = func.current_date()

    # 1. Summary counts
    total = db.execute(text("SELECT COUNT(*) FROM screenshot_logs")).scalar() or 0

    # 2. Category breakdown
    cat_rows = db.execute(text("""
        SELECT category, COUNT(*) as cnt
        FROM screenshot_logs
        GROUP BY category
        ORDER BY cnt DESC
    """)).fetchall()

    # 3. Per-employee totals
    emp_rows = db.execute(text("""
        SELECT employee_id, COUNT(*) as total,
               SUM(CASE WHEN category = 'Work' THEN 1 ELSE 0 END) as work_count,
               SUM(CASE WHEN category = 'Break' THEN 1 ELSE 0 END) as break_count,
               SUM(CASE WHEN category = 'Distraction' THEN 1 ELSE 0 END) as distraction_count
        FROM screenshot_logs
        GROUP BY employee_id
        ORDER BY total DESC
        LIMIT 20
    """)).fetchall()

    # 4. Last 7 days trend (date -> work/break/distraction counts)
    trend_rows = db.execute(text("""
        SELECT DATE(timestamp) as log_date, category, COUNT(*) as cnt
        FROM screenshot_logs
        WHERE timestamp >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(timestamp), category
        ORDER BY log_date ASC
    """)).fetchall()

    # 5. Hourly distribution (which hours are most active)
    hourly_rows = db.execute(text("""
        SELECT EXTRACT(HOUR FROM timestamp) as hour, COUNT(*) as cnt
        FROM screenshot_logs
        GROUP BY EXTRACT(HOUR FROM timestamp)
        ORDER BY hour ASC
    """)).fetchall()

# 6. Productivity score per employee (work / total * 100)
    productivity_rows = db.execute(text("""
        SELECT employee_id,
               ROUND(
                   (CASE WHEN COUNT(*) > 0
                        THEN SUM(CASE WHEN category = 'Work' THEN 1 ELSE 0 END)::float / COUNT(*) * 100
                        ELSE 0
                   END)::numeric, 1
               ) as score
        FROM screenshot_logs
        GROUP BY employee_id
        ORDER BY score DESC
        LIMIT 10
    """)).fetchall()

    return {
        "total_screenshots": total,
        "category_breakdown": [{"category": r[0], "count": r[1]} for r in cat_rows],
        "top_employees": [
            {
                "employee_id": r[0],
                "total": r[1],
                "work": r[2],
                "break": r[3],
                "distraction": r[4]
            }
            for r in emp_rows
        ],
        "daily_trend": [
            {"date": r[0], "category": r[1], "count": r[2]}
            for r in trend_rows
        ],
        "hourly_distribution": [{"hour": int(r[0]), "count": r[1]} for r in hourly_rows],
        "productivity_scores": [
            {"employee_id": r[0], "score": float(r[1])}
            for r in productivity_rows
        ]
    }


def get_analyst_response(question: str, db: Session) -> str:
    """
    1. Pull a summary of all activity from the DB
    2. Send it as context to Groq
    3. Return a plain English answer
    """
    try:
        # ── Compute all analytics ────────────────────────────────────────────
        analytics = _fetch_analytics(db)

        total = analytics["total_screenshots"]
        cat_lines = "\n".join(
            f"  {r['category']}: {r['count']} screenshots"
            for r in analytics["category_breakdown"]
        )
        emp_lines = "\n".join(
            f"  {r['employee_id']} | total={r['total']} | Work={r['work']} | Break={r['break']} | Distraction={r['distraction']}"
            for r in analytics["top_employees"]
        )
        trend_lines = "\n".join(
            f"  {r['date']} | {r['category']} = {r['count']}"
            for r in analytics["daily_trend"]
        )
        hour_lines = "\n".join(
            f"  {r['hour']:02d}:00 - {r['hour']:02d}:59 | {r['count']} screenshots"
            for r in analytics["hourly_distribution"]
        )
        score_lines = "\n".join(
            f"  {r['employee_id']} | productivity score: {r['score']}%"
            for r in analytics["productivity_scores"]
        )

        context = f"""
=== FULL EMPLOYEE ACTIVITY ANALYTICS ===

OVERALL: {total} total screenshots captured.

CATEGORY BREAKDOWN:
{cat_lines if cat_lines else "No data."}

TOP EMPLOYEES (work/break/distraction):
{emp_lines if emp_lines else "No data."}

LAST 7 DAYS TREND:
{trend_lines if trend_lines else "No data."}

HOURLY ACTIVITY DISTRIBUTION:
{hour_lines if hour_lines else "No data."}

PRODUCTIVITY SCORES (Work/Total %):
{score_lines if score_lines else "No data."}

Categories: Work = productive, Break = employee is on break, Distraction = employee is distracted.
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an HR Productivity Analyst. "
                        "Answer questions based ONLY on the provided employee data. "
                        "Be concise and specific. Include specific numbers in your answers. "
                        "Categories: Work = productive, Break = employee is on break, Distraction = employee is distracted. "
                        "If the data doesn't contain the answer, say so clearly."
                    )
                },
                {
                    "role": "user",
                    "content": f"Employee Data:\n{context}\n\nQuestion: {question}"
                }
            ]
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Error: {str(e)}"