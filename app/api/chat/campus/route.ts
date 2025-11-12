import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq AI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Campus API route called');
    const { message, history, university } = await request.json();
    console.log('Message received:', message);
    console.log('University:', university);

    if (!message) {
      console.error('No message provided');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('API key not found in environment');
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    console.log('API key found, initializing Groq for campus mode...');

    // System prompt untuk mode kampus
    const campusSystemPrompt = `Kamu adalah AI Campus Navigator untuk ${university || 'universitas'}.

INFORMASI KAMPUS UNS:

📚 KRS (Kartu Rencana Studi) di UNS:
- KRS dibuka setiap awal semester (biasanya 2 minggu sebelum perkuliahan dimulai)
- Akses melalui SIMASTER (Sistem Informasi Akademik UNS) di simaster.uns.ac.id
- Batas maksimal SKS: 24 SKS per semester (untuk mahasiswa dengan IPK >= 3.00)
- Batas minimal SKS: 12 SKS per semester
- KRS bisa direvisi dalam masa KRS dan masa revisi KRS (biasanya 2 minggu pertama kuliah)
- Wajib konsultasi dengan Dosen Pembimbing Akademik (DPA) sebelum finalisasi KRS

📍 Lokasi Gedung Utama di UNS:
- Rektorat: Gedung pusat administrasi kampus
- Perpustakaan Pusat: Buka Senin-Jumat 08.00-20.00, Sabtu 08.00-16.00
- Student Center: Pusat kegiatan mahasiswa
- Gedung Fakultas: Tersebar di 9 fakultas (FKIP, FEB, Hukum, FMIPA, FT, Pertanian, dll)

💰 Beasiswa di UNS:
- Beasiswa PPA (Peningkatan Prestasi Akademik)
- Beasiswa BBM (Bantuan Biaya Mahasiswa)
- Beasiswa Bidikmisi/KIP Kuliah
- Beasiswa prestasi dari fakultas masing-masing
- Info beasiswa cek di website kemahasiswaan UNS

🎯 UKM (Unit Kegiatan Mahasiswa) Populer:
- UKM Olahraga: Basket, Futsal, Voli, Badminton
- UKM Seni: Paduan Suara, Tari, Teater
- UKM Akademik: LPM, BEM, Himpunan Mahasiswa
- UKM Kerohanian: IMM, PMII, HMI

📅 Kalender Akademik:
- Semester Ganjil: September - Januari
- Semester Genap: Februari - Juni
- UTS: Minggu ke-8 perkuliahan
- UAS: Minggu ke-16 perkuliahan

🏫 Fasilitas Kampus:
- Wifi kampus tersedia di seluruh area (UNS-Wifi)
- Kantin tersebar di setiap fakultas
- Asrama mahasiswa (untuk yang memenuhi syarat)
- Klinik kesehatan kampus
- Masjid Nurul Iman

Tugasmu:
- Jawab pertanyaan tentang ${university || 'kampus'} dengan informasi di atas
- Berikan panduan step-by-step jika diperlukan
- Jika ditanya hal spesifik yang tidak ada di data, sarankan untuk cek ke website resmi atau hubungi fakultas
- Gunakan bahasa Indonesia yang ramah, santai tapi profesional
- Selalu helpful dan informatif

Jika ada pertanyaan di luar konteks kampus, arahkan kembali ke topik kampus dengan sopan.`;

    // Build conversation history - filter welcome messages
    const chatHistory = (history || [])
      .filter((msg: any) => {
        const content = msg.content || '';
        // Filter welcome message untuk mode kampus
        return !content.includes('Halo! Saya AI Campus Navigator');
      })
      .slice(-10) // Only keep last 10 messages for context
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

    // Build messages array with system prompt
    const messages = [
      {
        role: 'system' as const,
        content: campusSystemPrompt,
      },
      ...chatHistory,
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile', // Fast and good quality
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
    });

    const text = completion.choices[0]?.message?.content || 'Maaf, tidak ada respons.';

    console.log('Campus mode response generated successfully');
    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Error in campus chat API:', error);
    console.error('Error details:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
