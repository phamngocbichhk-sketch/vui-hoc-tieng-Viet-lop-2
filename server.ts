import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import https from 'https';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Static files
app.use(express.static(path.resolve(__dirname, 'public')));

// Ensure audio cache directory exists
const cacheDir = path.resolve(__dirname, 'public/assets/audio/cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// API Route: Standard Hanoi Female Teacher Voice (Natural & Sweet, NO robotic male voice)
app.get('/api/voice', async (req: Request, res: Response) => {
  const text = (req.query.text as string || '').trim();
  if (!text) {
    return res.status(400).send('Thiếu nội dung văn bản');
  }

  // Hash text to cache key
  const hash = crypto.createHash('md5').update(text).digest('hex');
  const cachedFilePath = path.join(cacheDir, `${hash}.mp3`);

  if (fs.existsSync(cachedFilePath)) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    return fs.createReadStream(cachedFilePath).pipe(res);
  }

  // Fetch standard Vietnamese female voice from Google TTS
  const encodedText = encodeURIComponent(text);
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodedText}`;

  https.get(
    ttsUrl,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } },
    (ttsRes) => {
      if (ttsRes.statusCode === 200) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        const fileStream = fs.createWriteStream(cachedFilePath);
        ttsRes.pipe(fileStream);
        ttsRes.pipe(res);
      } else {
        res.status(502).send('Lỗi khi tải giọng đọc');
      }
    }
  ).on('error', (err) => {
    console.error('Error fetching voice:', err);
    res.status(500).send('Lỗi máy chủ giọng đọc');
  });
});

// Gemini client initialization
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// API Route: Check AI status
app.get('/api/ai-status', (req: Request, res: Response) => {
  res.json({
    hasApiKey: !!apiKey,
    message: apiKey
      ? 'Đã kết nối trợ lý giọng đọc và chấm điểm Gemini AI'
      : 'Đang dùng giọng đọc mẫu chuẩn cô giáo Hà Nội',
  });
});

// API Route: Text-To-Speech with teacher voice
app.post('/api/tts', async (req: Request, res: Response) => {
  const { text, voice = 'Kore', speed = 1.0 } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Thiếu nội dung văn bản' });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng sử dụng Web Speech Synthesis của trình duyệt hoặc file âm thanh mẫu.',
    });
  }

  try {
    const prompt = `Hãy đọc đoạn văn sau với giọng cô giáo tiểu học Hà Nội dịu dàng, ấm áp, phát âm chuẩn xác từng thanh điệu tiếng Việt (hỏi, ngã, sắc, huyền, nặng), ngắt nghỉ đúng nhịp cho học sinh lớp 2 dễ theo dõi: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice as any },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'Không thể tạo âm thanh từ Gemini' });
    }

    res.json({
      audioUrl: `data:audio/wav;base64,${base64Audio}`,
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi tạo giọng đọc' });
  }
});

// API Route: Evaluate Reading (Voice Assessment)
app.post('/api/evaluate-reading', async (req: Request, res: Response) => {
  const { targetText, spokenText } = req.body;

  if (!targetText) {
    return res.status(400).json({ error: 'Thiếu bài đọc chuẩn' });
  }

  // Normalize texts for comparison
  const cleanTarget = targetText.trim();
  const cleanSpoken = (spokenText || '').trim();

  // If Gemini is available, provide rich teacher evaluation
  if (ai && cleanSpoken) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Bạn là cô giáo dạy Tiếng Việt lớp 2 chuẩn mực, tâm lý và yêu thương học sinh.
Một học sinh lớp 2 vừa đọc bài văn.
- Câu mẫu trong sách giáo khoa: "${cleanTarget}"
- Nội dung bé đọc được (qua nhận diện giọng nói): "${cleanSpoken}"

Hãy đánh giá bài đọc của bé và trả về kết quả dưới dạng JSON có cấu trúc sau:
{
  "stars": 1 | 2 | 3, // 3 là đọc rất tốt/hoàn hảo (tương đồng > 85%), 2 là đọc khá (60-85%), 1 là cần cố gắng thêm (< 60%)
  "accuracyScore": 0-100, // Phần trăm chính xác
  "teacherFeedback": "Lời nhận xét ấm áp, động viên, khen ngợi từ cô giáo bằng giọng điệu cô giáo lớp 2 (xưng 'cô', gọi 'con')",
  "misreadWords": ["từ bé đọc thiếu hoặc đọc nhầm nếu có"],
  "encouragement": "Một câu khẩu hiệu khích lệ bé đọc to, rõ ràng hơn"
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    } catch (e) {
      console.warn('Gemini evaluation fallback to heuristic:', e);
    }
  }

  // Fallback intelligent heuristic matching
  const targetWords = cleanTarget.toLowerCase().replace(/[.,!?;:"'“”]/g, '').split(/\s+/).filter(Boolean);
  const spokenWords = cleanSpoken.toLowerCase().replace(/[.,!?;:"'“”]/g, '').split(/\s+/).filter(Boolean);

  let matchCount = 0;
  const missedWords: string[] = [];

  targetWords.forEach((tw: string) => {
    if (spokenWords.includes(tw)) {
      matchCount++;
    } else {
      missedWords.push(tw);
    }
  });

  const accuracy = targetWords.length > 0 ? Math.round((matchCount / targetWords.length) * 100) : 0;
  let stars = 1;
  let feedback = 'Con cần luyện đọc thêm nhiều lần để đọc trôi chảy hơn nhé!';
  let encouragement = 'Cố gắng lên nào, cô tin con sẽ đọc hay hơn vào lần sau!';

  if (accuracy >= 80) {
    stars = 3;
    feedback = 'Hoan hô con! Con đọc rất to, rõ ràng, lưu loát và đúng từ!';
    encouragement = 'Con xứng đáng nhận 3 ngôi sao xuất sắc của cô!';
  } else if (accuracy >= 50) {
    stars = 2;
    feedback = 'Con đọc khá tốt rồi, chỉ cần chú ý phát âm rõ hơn một vài từ khó nhé!';
    encouragement = 'Chăm chỉ luyện đọc mỗi ngày, con sẽ tiến bộ vượt bậc!';
  }

  res.json({
    stars,
    accuracyScore: accuracy,
    teacherFeedback: feedback,
    misreadWords: missedWords.slice(0, 4),
    encouragement,
  });
});

// Setup Vite middlewares in development
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Vui Đọc Tiếng Việt 2 running on http://localhost:${PORT}`);
  });
}

startServer();
