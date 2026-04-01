import psycopg2
import traceback
try:
    conn = psycopg2.connect(dbname='monitor_db', user='postgres', password='basma708', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    cur.execute('SELECT version()')
    print('OK', cur.fetchone())
    cur.execute("SELECT tablename FROM pg_tables WHERE schemaname='public';")
    print('tables', cur.fetchall())
    conn.close()
except Exception as e:
    print('ERR', e)
    traceback.print_exc()
