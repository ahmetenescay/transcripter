import os
from google import genai
# pyrefly: ignore [missing-import]
from google.genai import types, errors
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")

# Use the recommended model for general text tasks
MODEL_NAME = 'gemini-2.5-flash' 

def summarize_transcripts(transcripts: list[str]) -> str:
    if not API_KEY:
        raise ValueError("Gemini API Key is not configured. Please add it to the .env file.")
        
    client = genai.Client(api_key=API_KEY)
    
    system_instruction = "You are a professional transcript analyst and expert consultant. You must base your answers strictly on the provided transcript sources. Do not hallucinate outside information."
    
    prompt = "Please provide a comprehensive summary of the following video transcripts:\n\n"
    for i, t in enumerate(transcripts):
        prompt += f"--- Video {i+1} ---\n{t}\n\n"
        
    prompt += "Summary:"
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            )
        )
        return response.text
    except errors.APIError as e:
        if e.code == 503:
            raise RuntimeError("Google Gemini API is currently experiencing a high demand spike (503). Please try again in a minute.")
        raise RuntimeError(f"Gemini API Error: {str(e)}")

def qa_transcripts(transcripts: list[str], question: str) -> str:
    if not API_KEY:
        raise ValueError("Gemini API Key is not configured. Please add it to the .env file.")
        
    client = genai.Client(api_key=API_KEY)
    
    system_instruction = "You are a professional transcript analyst and expert consultant. You must base your answers strictly on the provided transcript sources. Do not hallucinate outside information."
    
    prompt = "Use the following video transcripts to answer the question at the end.\n\n"
    prompt += "Transcripts:\n"
    for i, t in enumerate(transcripts):
        prompt += f"--- Video {i+1} ---\n{t}\n\n"
        
    prompt += f"Question: {question}\nAnswer:"
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            )
        )
        return response.text
    except errors.APIError as e:
        if e.code == 503:
            raise RuntimeError("Google Gemini API is currently experiencing a high demand spike (503). Please try again in a minute.")
        raise RuntimeError(f"Gemini API Error: {str(e)}")
