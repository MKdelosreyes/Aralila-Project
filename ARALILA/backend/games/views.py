from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
from dotenv import load_dotenv
from openai import OpenAI
import json

# Load .env variables
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@csrf_exempt
def evaluate_emoji_sentence(request):
    # student_answer = request.GET.get("answer", "")
    # emojis = request.GET.get("emojis", "")
    # if request.method == "POST":
    data = json.loads(request.body)
    student_answer = data.get("answer", "")
    emojis = data.get("emojis", [])

    # Build the prompt for evaluation
    prompt = f"""
        You are a Filipino language teacher. 
        Keywords shown to the student: {emojis}
        Student's sentence: "{student_answer}"

        The student's answer must be pure Filipino text (no emojis).

        Please:
        1. Check if it is grammatically correct in Filipino.
        2. Check if the meaning matches the given key concepts ({emojis}). 
        It is acceptable if not every keyword is mentioned literally, as long as the main idea is correct.
        3. Give a short explanation (in Filipino) about what is right or wrong.
        4. Provide a corrected version if needed.

        Respond ONLY in valid JSON with keys:
        valid (true/false), explanation (string), corrected (string).
        """


    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",   # 💡 you can also use gpt-5-mini if available
            messages=[
                {"role": "system", "content": "You are a helpful teacher."},
                {"role": "user", "content": prompt}
            ]
        )

        raw_text = response.choices[0].message.content

        # Try parsing into JSON
        result = {}
        try:
            # remove code fences if present
            cleaned = raw_text.strip().replace("```json", "").replace("```", "").strip()
            result = json.loads(cleaned)
        except json.JSONDecodeError:
            result = {
                "valid": False,
                "explanation": "AI did not return valid JSON.",
                "corrected": raw_text
            }

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
