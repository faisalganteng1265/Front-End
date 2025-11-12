import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  completed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { tasks, analysisType } = await request.json();

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Invalid tasks data' },
        { status: 400 }
      );
    }

    // Filter only pending tasks for analysis
    const pendingTasks = tasks.filter((task: Task) => !task.completed);

    if (pendingTasks.length === 0) {
      return NextResponse.json({
        response: '🎉 Selamat! Kamu tidak punya tugas yang pending. Semua tugas sudah selesai!',
      });
    }

    let prompt = '';

    if (analysisType === 'prioritize') {
      // AI Task Prioritizer
      prompt = `Kamu adalah AI Task Prioritizer yang membantu mahasiswa mengatur prioritas tugas mereka.

Berikut adalah daftar tugas yang belum selesai:

${pendingTasks.map((task: Task, index: number) => `
${index + 1}. **${task.title}**
   - Mata Kuliah: ${task.category || 'Tidak disebutkan'}
   - Deskripsi: ${task.description || 'Tidak ada deskripsi'}
   - Prioritas saat ini: ${task.priority}
   - Deadline: ${task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tidak ada deadline'}
`).join('\n')}

Tugas kamu:
1. Analisis semua tugas berdasarkan deadline, prioritas, dan urgensi
2. Berikan rekomendasi urutan pengerjaan (mana yang harus dikerjakan terlebih dahulu)
3. Berikan alasan singkat untuk setiap rekomendasi
4. Berikan tips produktivitas untuk menyelesaikan semua tugas

Format jawaban:
🎯 **REKOMENDASI PRIORITAS TUGAS**

**Urutan Pengerjaan yang Disarankan:**

1. [Nama Tugas]
   ⏰ Alasan: [Jelaskan mengapa tugas ini prioritas utama]

2. [Nama Tugas]
   ⏰ Alasan: [Jelaskan mengapa tugas ini prioritas kedua]

(dan seterusnya...)

💡 **Tips Produktivitas:**
- [Tip 1]
- [Tip 2]
- [Tip 3]

Jawab dalam bahasa Indonesia yang ramah dan memotivasi!`;
    } else if (analysisType === 'estimate') {
      // Smart Time Estimator
      const today = new Date();
      const todayFormatted = today.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      prompt = `Kamu adalah AI Time Estimator yang membantu mahasiswa memperkirakan waktu pengerjaan tugas.

**INFORMASI PENTING:**
- Hari ini adalah: ${todayFormatted}
- Tanggal saat ini: ${today.toISOString().split('T')[0]}
- JANGAN memberikan saran mulai di masa lalu! Semua saran harus mulai dari hari ini atau sesudahnya.

Berikut adalah daftar tugas yang belum selesai:

${pendingTasks.map((task: Task, index: number) => {
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const daysUntilDeadline = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return `
${index + 1}. **${task.title}**
   - Mata Kuliah: ${task.category || 'Tidak disebutkan'}
   - Deskripsi: ${task.description || 'Tidak ada deskripsi'}
   - Deadline: ${deadline ? deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tidak ada deadline'}
   - Sisa waktu: ${daysUntilDeadline !== null ? `${daysUntilDeadline} hari lagi` : 'Tidak ada deadline'}
`;
}).join('\n')}

Tugas kamu:
1. Perkirakan waktu yang dibutuhkan untuk menyelesaikan setiap tugas (dalam jam)
2. Berikan breakdown waktu jika tugas bisa dipecah menjadi sub-tasks
3. Berikan saran kapan sebaiknya mulai mengerjakan berdasarkan deadline (HARUS mulai dari hari ini atau sesudahnya, JANGAN masa lalu!)
4. Total waktu yang dibutuhkan untuk menyelesaikan semua tugas
5. Pertimbangkan deadline dan prioritaskan tugas yang deadline-nya lebih dekat

Format jawaban:
⏱️ **ESTIMASI WAKTU PENGERJAAN**

**Per Tugas:**

1. **[Nama Tugas]**
   - Estimasi waktu: [X jam]
   - Breakdown:
     • [Sub-task 1]: [X jam]
     • [Sub-task 2]: [X jam]
   - Saran mulai: [Sebutkan tanggal yang realistis, MINIMAL mulai hari ini (${todayFormatted})]
   - Rekomendasi: [Kapan harus selesai, jadwal pengerjaan]

2. **[Nama Tugas]**
   (format sama...)

📊 **Ringkasan:**
- Total waktu dibutuhkan: [X jam]
- Rata-rata per tugas: [X jam]
- Rekomendasi jadwal: [Saran jadwal harian mulai dari hari ini]

⚠️ **Peringatan Deadline:**
[Sebutkan tugas mana yang deadline-nya mendesak dan perlu dikerjakan segera]

💡 **Tips Manajemen Waktu:**
- [Tip 1]
- [Tip 2]
- [Tip 3]

PENTING: Semua saran tanggal mulai HARUS mulai dari hari ini (${todayFormatted}) atau sesudahnya. TIDAK BOLEH masa lalu!

Jawab dalam bahasa Indonesia yang ramah dan realistis!`;
    } else {
      return NextResponse.json(
        { error: 'Invalid analysis type. Use "prioritize" or "estimate"' },
        { status: 400 }
      );
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || 'Maaf, tidak ada respons dari AI.';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error in AI Task Assistant:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
