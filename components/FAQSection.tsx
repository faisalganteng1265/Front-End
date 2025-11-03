'use client';

import { useState, useRef, useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Apakah AI Campus Guide bisa menjawab semua pertanyaan tentang kampus?',
    answer: 'Ya! AI Campus Guide kami dirancang untuk menjawab berbagai pertanyaan seputar kehidupan kampus, mulai dari cara mengisi KRS, lokasi gedung, info dosen, prosedur beasiswa, jadwal kuliah, hingga informasi UKM. AI kami terus belajar dan diperbarui untuk memberikan jawaban yang akurat dan relevan.',
  },
  {
    question: 'Bagaimana cara kerja Event Recommender?',
    answer: 'Event Recommender menggunakan AI untuk menganalisis minat, jurusan, dan aktivitas Anda sebelumnya. Berdasarkan data tersebut, sistem akan merekomendasikan event seperti seminar, lomba, kegiatan UKM, dan volunteering yang paling sesuai dengan profil Anda. Semakin sering Anda menggunakan fitur ini, semakin akurat rekomendasinya!',
  },
  {
    question: 'Apakah Smart Schedule Builder bisa mendeteksi jadwal yang bentrok?',
    answer: 'Tentu saja! Smart Schedule Builder dilengkapi dengan sistem deteksi otomatis yang akan memperingatkan Anda jika ada jadwal yang bentrok. AI juga akan memberikan saran alternatif jadwal yang optimal, mempertimbangkan waktu istirahat, dan memastikan work-life balance Anda tetap terjaga.',
  },
  {
    question: 'Bagaimana Peer Connect AI mencocokkan saya dengan teman atau mentor?',
    answer: 'Peer Connect AI menggunakan algoritma machine learning yang menganalisis minat akademik, hobi, tujuan karir, dan preferensi Anda. Sistem akan mencocokkan Anda dengan mahasiswa atau mentor yang memiliki kesamaan atau dapat saling melengkapi. Fitur ini membantu Anda membangun networking yang berkualitas di kampus.',
  },
  {
    question: 'Apakah data pribadi saya aman?',
    answer: 'Keamanan data Anda adalah prioritas utama kami. Semua informasi pribadi dienkripsi dan disimpan dengan standar keamanan tingkat enterprise. Kami tidak akan membagikan data Anda kepada pihak ketiga tanpa izin Anda. Platform kami juga mematuhi regulasi perlindungan data yang berlaku.',
  },
  {
    question: 'Apakah layanan ini berbayar?',
    answer: 'Kami menyediakan paket gratis dengan fitur dasar yang sudah sangat lengkap untuk mendukung kehidupan kampus Anda. Untuk fitur premium seperti mentoring prioritas, analitik mendalam, dan rekomendasi yang lebih personal, tersedia paket berlangganan dengan harga terjangkau khusus untuk mahasiswa.',
  },
];

const quickQuestions = [
  'Bagaimana cara mengisi KRS?',
  'Dimana lokasi perpustakaan?',
  'Apa saja UKM yang tersedia?',
  'Bagaimana cara mendaftar beasiswa?',
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Halo! Saya AI Campus Navigator UNS. Saya siap membantu menjawab pertanyaan seputar kampus. Silakan pilih pertanyaan cepat di bawah atau ketik pertanyaan Anda sendiri!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Detect when this section becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay animation slightly for smoother effect
          setTimeout(() => setIsVisible(true), 200);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <section ref={sectionRef} id="faq-section" className="py-20 px-0 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      <div className="w-full relative z-10">
        {/* Title */}
        <div className="text-center mb-16 px-8">
          <h2
            className="text-5xl md:text-6xl mb-8 text-white"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif', letterSpacing: '0.02em' }}
          >
            FAQs & AI Assistant
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-[60%_40%] gap-0">
          {/* Left Column - FAQ */}
          <div className="px-8 md:px-16">
            <div className="space-y-0">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="group border-t border-gray-700 last:border-b last:border-gray-700 transition-all duration-300"
                >
                  {/* Question Button */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-0 py-6 flex items-center justify-between text-left relative z-10 group"
                  >
                    <span
                      className="text-lg md:text-xl font-normal text-white pr-4"
                      style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                    >
                      {faq.question}
                    </span>

                    {/* Chevron Icon */}
                    <div className={`flex-shrink-0 transition-all duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                      <svg
                        className="w-5 h-5 text-emerald-400 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Answer */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-0 pb-6 relative z-10">
                      <p
                        className="text-gray-300 leading-relaxed text-base"
                        style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Chatbot */}
          <div className="lg:sticky lg:top-24 h-fit px-8 md:px-16">
            <div
              className={`bg-gray-900/50 backdrop-blur-sm border-l border-emerald-500/20 overflow-hidden flex flex-col transition-opacity duration-700 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                height: '600px',
              }}
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                <h3
                  className="text-xl text-white font-semibold flex items-center gap-2"
                  style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                >
                  <span className="text-2xl">🤖</span>
                  AI Campus Navigator
                </h3>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800/80 text-gray-100 border border-gray-700'
                      }`}
                      style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                    >
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800/80 border border-gray-700 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(q)}
                        className="px-3 py-1.5 bg-gray-800/60 hover:bg-emerald-600/20 border border-emerald-500/30 rounded-full text-sm text-gray-300 hover:text-emerald-400 transition-all duration-200"
                        style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-gray-700/50 bg-gray-900/30">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ketik pertanyaan Anda..."
                    className="flex-1 bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl px-6 py-3 font-semibold transition-all duration-200 disabled:cursor-not-allowed"
                    style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                  >
                    Kirim
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(16, 185, 129, 0.6), rgba(20, 184, 166, 0.6));
          border-radius: 10px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(16, 185, 129, 0.8), rgba(20, 184, 166, 0.8));
        }

        /* Firefox */
        .scrollbar-custom {
          scrollbar-width: thin;
          scrollbar-color: rgba(16, 185, 129, 0.6) rgba(31, 41, 55, 0.5);
        }

      `}</style>
    </section>
  );
}
