from langchain_ollama import OllamaLLM
from langchain_community.utilities import SQLDatabase
from langchain_experimental.sql import SQLDatabaseChain
from langchain_core.prompts import PromptTemplate

# 1. Database Connection
# Replace 'postgres', 'yourpassword', and 'your_db_name' with your actual details
DB_URI = "postgresql://postgres:basma708@localhost:5432/monitor_db"
db = SQLDatabase.from_uri(DB_URI)

# 2. Initialize the LLM (Using Ollama Llama3)
# You can change "llama3" to "mistral" or "phi3" if you prefer
llm = OllamaLLM(model="llama3", temperature=0)

# 3. Custom Prompt (The Instructions)
# This tells the AI how to read your 'category' and 'timestamp' columns
analyst_prompt_template = """You are an HR Data Analyst for an Employee Monitoring System.
The database has a table with columns: employee_id, category, and timestamp.
- 'Work' category means productive time.
- 'Break' category means unproductive/wasted time.
- 'Distraction' category means unproductive/wasted time.
- When asked for 'total time', calculate the difference between the earliest and latest timestamp for that user.

Question: {input}
SQLQuery: """

PROMPT = PromptTemplate(
    input_variables=["input"], 
    template=analyst_prompt_template
)

# 4. Create the Chain
analyst_chain = SQLDatabaseChain.from_llm(
    llm, 
    db, 
    prompt=PROMPT, 
    verbose=True # This lets you see the SQL in your terminal
)

def get_analyst_response(query: str):
    try:
        return analyst_chain.run(query)
    except Exception as e:
        return f"Error analyzing data: {str(e)}"