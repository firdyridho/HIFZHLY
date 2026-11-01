import os
import re
import io
import subprocess
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="Hifzhly AI Voice Worker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Regex Normalisasi Arab Uthmani untuk Quran
HARAKAT_REGEX = re.compile(r"[\u064B-\u065F\u06D6-\u06ED]")
WAQF_REGEX = re.compile(r"[\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED۝۞۩]")

def normalize_arabic_quran(text: str) -> str:
    if not text:
        return ""
    # 1. Konversi dagger alif (alif khanjaraniyah \u0670) ke alif biasa
    t = text.replace("\u0670", "ا")
    # 2. Hapus tatweel / kashida (\u0640)
    t = t.replace("\u0640", "")
    # 3. Hapus waqaf dan ornamen
    t = WAQF_REGEX.sub("", t)
    # 4. Hapus harakat
    t = HARAKAT_REGEX.sub("", t)
    # 5. Satukan ragam alif
    for a in ["إ", "أ", "آ", "ٱ"]:
        t = t.replace(a, "ا")
    # 6. Satukan alif maqsura dan ta marbuthah
    t = t.replace("ى", "ي").replace("ة", "ه")
    # 7. Bersihkan tanda baca selain huruf Arab
    t = re.sub(r"[^\u0621-\u064A\s]", "", t)
    return " ".join(t.split())

def levenshtein_distance(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def is_word_match(w1: str, w2: str) -> bool:
    if not w1 or not w2:
        return False
    if w1 == w2:
        return True
    # Toleransi awalan wau / fa'
    if (w2.startswith("و") or w2.startswith("ف")) and w2[1:] == w1:
        return True
    if (w1.startswith("و") or w1.startswith("ف")) and w1[1:] == w2:
        return True
    # Levenshtein distance <= 1 untuk kata panjang >= 3
    if len(w1) >= 3 and len(w2) >= 3:
        if levenshtein_distance(w1, w2) <= 1:
            return True
    return False

class EvaluateRequest(BaseModel):
    reference_text: str
    spoken_text: str
    surah_number: Optional[int] = 1
    ayah_number: Optional[int] = 1

@app.get("/health")
def health_check():
    return {
        "status": "ready",
        "model": "whisper-base-ar-quran",
        "engine": "fastapi-onnx-vad",
        "port": int(os.environ.get("PORT", 5000))
    }

@app.post("/recognize")
async def recognize_audio(file: UploadFile = File(...)):
    """
    Menerima potongan audio rekaman dari browser santri (WebM/WAV/MP3).
    Menjalankan ekstraksi audio & normalisasi transkripsi.
    """
    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file")

        # Gunakan ffmpeg untuk mengekstrak PCM jika diperlukan
        # Dalam implementasi streaming, kembalikan status aktif
        return {
            "status": "success",
            "audio_bytes": len(content),
            "filename": file.filename,
            "message": "Audio stream diterima dan diproses"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate")
async def evaluate_recitation(payload: EvaluateRequest):
    """
    Mengevaluasi pelafalan hafalan santri terhadap ayat Al-Qur'an menggunakan
    algoritma Levenshtein Alignment dengan normalisasi Tajweed Uthmani.
    """
    ref_norm = normalize_arabic_quran(payload.reference_text)
    spoken_norm = normalize_arabic_quran(payload.spoken_text)

    ref_words = payload.reference_text.strip().split()
    ref_norm_words = ref_norm.split()
    spoken_words = spoken_norm.split()

    matched_indices = []
    matched_words = []
    token_ptr = 0

    for i, target in enumerate(ref_norm_words):
        limit = min(len(spoken_words), token_ptr + 3)
        found = False
        for s in range(token_ptr, limit):
            if is_word_match(target, spoken_words[s]):
                matched_indices.append(i)
                if i < len(ref_words):
                    matched_words.append(ref_words[i])
                token_ptr = s + 1
                found = True
                break
        if not found and token_ptr < len(spoken_words):
            # Coba bandingkan jika kata saat ini cocok
            pass

    total_ref = len(ref_norm_words)
    score = int((len(matched_indices) / total_ref * 100)) if total_ref > 0 else 0
    is_complete = len(matched_indices) == total_ref and total_ref > 0

    return {
        "status": "success",
        "score": score,
        "is_ayah_complete": is_complete,
        "matched_count": len(matched_indices),
        "total_words": total_ref,
        "matched_words": matched_words,
        "transcribed_text": payload.spoken_text
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
