import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "3001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
