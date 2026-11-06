import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Available models in order of priority & speed
const AVAILABLE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
];

// Robust multi-model failover function to guarantee responses without 429/503 interruptions
async function callGeminiWithFailover(options: {
  contents: any;
  config?: any;
}): Promise<any> {
  let lastError: any = null;
  for (const model of AVAILABLE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} failed (${err?.status || err?.message}). Attempting next model...`);
    }
  }
  throw lastError;
}

// Fallback kitchen emergency solver logic if model is temporarily unavailable
function getEmergencyFallbackSolution(problem: string, language: 'en' | 'hi'): string {
  const q = (problem || '').toLowerCase();
  const isHi = language === 'hi';

  if (q.includes('namak') || q.includes('salt') || q.includes('salty')) {
    return isHi
      ? `🔍 **समस्या की पहचान:** भोजन में नमक की मात्रा अधिक हो गई है।\n\n⚡ **तुरंत उपाय (Emergency Fix):**\n1. **कच्चा आलू डालें:** एक बड़े कच्चे आलू को छीलकर दो टुकड़ों में काटें और उबलती हुई ग्रेवी में 10-12 मिनट के लिए छोड़ दें। आलू अतिरिक्त नमक को पूरी तरह सोख लेता है। परोसने से पहले इसे निकाल दें।\n2. **गुंधे आटे की गोलियां:** गेहूं के आटे की 3-4 छोटी-छोटी लोइयां बनाकर ग्रेवी में 8 मिनट तक उबालें, फिर निकाल कर अलग कर दें।\n3. **मलाई या ताजा दही:** यदि सब्जी तीखी या मसालेदार है, तो 2 बड़े चम्मच ताजा फेंटा हुआ दही, मलाई या काजू पेस्ट मिलाएं।\n4. **नींबू का रस व हल्की चीनी:** सूखी सब्जी में आधा चम्मच नींबू का रस और चुटकी भर चीनी मिलाने से खारापन एकदम संतुलित हो जाता है।\n\n🛡️ **भविष्य के लिए सुझाव:** खाना पकाते समय शुरुआत में आधा नमक ही डालें। जब पानी सूखकर ग्रेवी गाढ़ी हो जाए, तब अंत में चखकर बाकी नमक मिलाएं।`
      : `🔍 **Problem Diagnosis:** Excess salt concentration in the dish.\n\n⚡ **Immediate Emergency Fixes:**\n1. **Raw Potato Technique:** Peel and cut a raw potato into halves and drop it into the simmering gravy for 10-12 minutes. Potatoes absorb excess sodium like a sponge. Remove before serving.\n2. **Kneaded Dough Balls:** Roll 3-4 small balls of whole wheat dough and simmer them in the curry for 8 minutes; discard before plating.\n3. **Cream or Yogurt:** Stir in 2 tablespoons of whisked heavy cream, coconut milk, or fresh curd to mellow the saltiness.\n4. **Acid Balance:** For dry sautéed dishes, squeeze half a fresh lemon or add a pinch of sugar to harmonize flavors.\n\n🛡️ **Prevention Tip:** Always salt in stages—season lightly at the start and do a final taste check when the liquid has reduced.`;
  }

  if (q.includes('patli') || q.includes('watery') || q.includes('thin') || q.includes('gravy')) {
    return isHi
      ? `🔍 **समस्या की पहचान:** ग्रेवी बहुत पतली और पानीदार हो गई है।\n\n⚡ **तुरंत उपाय:**\n1. **ढक्कन खोलकर उबालें:** कड़ाही का ढक्कन हटाकर मध्यम-तेज आंच पर 5-7 मिनट पकाएं ताकि अतिरिक्त पानी भाप बनकर उड़ जाए।\n2. **भुना हुआ बेसन:** 1 चम्मच बेसन को हल्के घी में 1 मिनट भूनकर ग्रेवी में मिलाएं, इससे 2 मिनट में गाढ़ापन और लाजवाब स्वाद आ जाएगा।\n3. **उबला मैश किया आलू:** एक छोटा उबला आलू अच्छी तरह मैश करके मिलाएं।\n\n🛡️ **भविष्य के लिए सुझाव:** शुरुआत में कम पानी डालें; जरूरत पड़ने पर ही गर्म पानी थोड़ा-थोड़ा मिलाएं।`
      : `🔍 **Problem Diagnosis:** Gravy or sauce has too much liquid and lacks thickness.\n\n⚡ **Immediate Emergency Fixes:**\n1. **Open Simmer:** Remove the lid and let the gravy bubble on medium-high heat for 6-8 minutes to evaporate excess water.\n2. **Roasted Gram Flour (Besan) Slurry:** Dry-roast 1 tbsp besan or cornstarch with 2 tbsp water, whisk into the simmering gravy; it thickens within 2 minutes.\n3. **Mashed Potato or Cashew Paste:** Whisk in 1 tbsp cashew paste or a fork-mashed boiled potato for restaurant-style velvety body.\n\n🛡️ **Prevention Tip:** Always add water gradually in small batches, especially when using watery vegetables like tomatoes or gourds.`;
  }

  if (q.includes('chawal') || q.includes('rice') || q.includes('geela') || q.includes('mushy') || q.includes('overcook')) {
    return isHi
      ? `🔍 **समस्या की पहचान:** चावल ज्यादा पककर गीले और चिपचिपे हो गए हैं।\n\n⚡ **तुरंत उपाय:**\n1. **थाली में फैलाएं:** तुरंत चावल को एक बड़ी खुली थाली में निकालें और पंखे के नीचे 10 मिनट ठंडा होने दें। भाप निकलने से दाने अलग-अलग हो जाएंगे।\n2. **ब्रेड का टुकड़ा:** गर्म बर्तन में चावल के ऊपर 2 ब्रेड स्लाइस रखकर 5 मिनट ढक दें; ब्रेड अतिरिक्त नमी सोख लेगी।\n3. **तवा पुलाव या कटलेट्स:** यदि बहुत ज्यादा गल गए हैं, तो इन्हें फ्रिज में ठंडा करके फ्राइड राइस या कुरकुरे राइस कटलेट्स बना लें!\n\n🛡️ **भविष्य के लिए सुझाव:** बासमती चावल के लिए 1 कप चावल में केवल 1.75 से 2 कप पानी ही मापकर डालें।`
      : `🔍 **Problem Diagnosis:** Overcooked, mushy, or sticky rice.\n\n⚡ **Immediate Emergency Fixes:**\n1. **Spread & Cool:** Immediately spread the rice across a wide flat tray and place it under a table fan for 8-10 minutes. Removing the residual steam stops cooking and firms up grains.\n2. **Bread Slice Moisture Trap:** Place 1-2 slices of bread right on top of warm rice and cover for 5 minutes; bread absorbs excess dampness.\n3. **Re-purpose:** If completely soft, chill in the fridge and transform into crispy rice cutlets, tawa pulao, or comforting curd rice.\n\n🛡️ **Prevention Tip:** Use a strict 1:2 or 1:1.75 rice-to-water ratio and never stir boiling rice with force.`;
  }

  if (q.includes('cake') || q.includes('sink') || q.includes('phool') || q.includes('rise')) {
    return isHi
      ? `🔍 **समस्या की पहचान:** केक बीच में से बैठ गया या ठीक से फूला नहीं।\n\n⚡ **कारण और उपाय:**\n1. **ओवन का दरवाजा जल्दी खोलना:** बेकिंग के पहले 20 मिनट ओवन कभी न खोलें, तापमान गिरने से फूला हुआ केक बैठ जाता है।\n2. **बेकिंग पाउडर की जांच:** बेकिंग पाउडर की एक्सपायरी जांचें (गर्म पानी में डालने पर तेजी से बुलबुले उठने चाहिए)।\n3. **सुधार (Fix):** यदि केक बीच से धंस गया है, तो उस हिस्से को चॉकलेट गनाश, ताजे फल या व्हिप्ड क्रीम से भरकर शानदार लावा केक बना लें!\n\n🛡️ **भविष्य के लिए सुझाव:** ओवन को हमेशा 10-15 मिनट पहले सही तापमान (180°C) पर प्रीहीट करें।`
      : `🔍 **Problem Diagnosis:** Cake collapsed in the middle or did not rise.\n\n⚡ **Causes & Immediate Solutions:**\n1. **Early Oven Opening:** Opening the oven door during the first 20 minutes drops the internal temperature, collapsing the rising gluten structure.\n2. **Expired Leavener:** Check that your baking powder/soda is fresh (it should fizz vigorously in warm water).\n3. **Presentation Rescue:** Trim the cake level with a serrated knife, or fill the depressed center with chocolate ganache, berries, or whipped cream for an elegant volcano cake!\n\n🛡️ **Prevention Tip:** Always preheat oven for 15 mins at exact temperature and measure leavening agents with level measuring spoons.`;
  }

  return isHi
    ? `🔍 **समस्या की पहचान:** रसोई की सामान्य पकाने की कठिनाई।\n\n⚡ **तुरंत उपाय:**\n1. आंच को तुरंत धीमा करें ताकि भोजन जले या अतिरिक्त सूखे नहीं।\n2. यदि खारापन या तीखापन अधिक है, तो थोड़ा दूध, मलाई, या नींबू का रस मिलाकर स्वाद संतुलित करें।\n3. यदि भोजन नीचे से जलने लगा है, तो बिना तले को खुरचे ऊपर का साफ हिस्सा तुरंत दूसरे बर्तन में पलट लें।\n\n🛡️ **भविष्य के लिए सुझाव:** हमेशा धीमी से मध्यम आंच पर पकाएं और मसाले धीरे-धीरे जोड़ें।`
    : `🔍 **Problem Diagnosis:** Common kitchen preparation challenge.\n\n⚡ **Immediate Practical Action:**\n1. Reduce heat to low immediately to stop scorch or over-reduction.\n2. If flavor is off-balance, balance with fat (butter/cream), acid (lemon/vinegar), or a pinch of sugar.\n3. If burning bottom occurred, gently ladle the top unburned portion into a fresh pot without scraping the bottom.\n\n🛡️ **Prevention Tip:** Keep heat on medium-low and stir intermittently with a flat wooden spatula.`;
}

// AI Kitchen Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, language = 'en' } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const isHi = language === 'hi';

    const systemInstruction = `You are KitchenBee AI, an expert, encouraging, warm, and highly practical kitchen companion.
Official tagline: "Buzzing with Smart Kitchen Ideas!".
Your role is to help students, beginners, everyday cooks, and families with daily cooking, recipes, ingredients, food preparation, kitchen techniques, food storage, hygiene, and emergency kitchen problem solving.

==================================================
CRITICAL MANDATORY LANGUAGE DIRECTIVE:
The user has set the application interface language to: "${isHi ? 'HINDI (हिंदी)' : 'ENGLISH'}".
You MUST generate your ENTIRE response in ${isHi ? 'natural, fluent, easy-to-understand Hindi written in Devanagari script (हिंदी)' : 'clear, simple, natural English'}.
STRICT RULE: Even if the user writes their query in English (e.g. "How to make vegetable pulao?" or "What can I cook with potatoes?") or in Hinglish (e.g. "sabzi me namak kam kaise kare", "aate me kitna pani dale", "bina oven cake"), because the app language is ${isHi ? 'HINDI' : 'ENGLISH'}, your response MUST BE 100% IN ${isHi ? 'HINDI (हिंदी - Devanagari script)' : 'ENGLISH'}.
Do NOT output English paragraphs, English headings, or English bullet points when the interface language is HINDI.
You may only include familiar English terms inside parentheses next to Hindi words where helpful (e.g. "बासमती चावल (Basmati Rice)").
==================================================

CORE OPERATING INSTRUCTIONS:
1. DIRECT, COMPLETE & ACTIONABLE ANSWERS:
   - NEVER tell the user to "Please ask again", "Please try again", or "Could you rephrase your question?". If a question is understandable (even with typos or in informal Hinglish), answer it directly and comprehensively.
   - For recipe requests: give a warm 1-sentence intro, prep and cook time, list of ingredients with clear measurements, and step-by-step numbered cooking instructions, followed by Chef Bee's pro-tip.
   - For ingredient combinations (e.g., potatoes, onions, tomatoes): suggest 2-3 specific, mouthwatering dishes immediately and explain how to make the best one step-by-step.
   - For common mishaps (too salty, watery gravy, burnt bottom, mushy rice, cracked cake): provide immediate recovery steps and preventive tips.
   - For comparisons (e.g., baking powder vs baking soda): explain differences simply, how they activate, and when to use which.
   - For dough/measurements (e.g., water for kneading wheat flour): provide exact ratios (e.g. 1 cup flour needs approx. 0.5 to 0.6 cup water, added in batches) and tips for soft rotis.
   - For food storage & safety: explain the 2-hour rule, refrigeration at <40°F (4°C), airtight containers, 3-4 days consumption timeline, and safe reheating.
   - For no-oven baking: explain the kadai/pressure cooker stovetop method using a salt/sand layer and a wire stand.

2. CONVERSATION CONTEXT & FOLLOW-UP MEMORY:
   - Remember previous questions and answers in this conversation. When the user asks follow-up questions (e.g. "Can I add paneer to it?", "How much salt?", "What if I don't have butter?"), understand and reply in the context of the dish being discussed.

3. TONE & FORMATTING:
   - Friendly, encouraging, and beginner-accessible.
   - Use clean Markdown with bold headers (### or **Title**), bullet lists, and numbered steps so it is comfortable to read.
   - Add a gentle bee mascot touch (e.g. 🐝).`;

    // Filter messages to valid turns
    const cleanMessages = messages
      .filter((m: any) => m && m.content && typeof m.content === 'string' && m.content.trim())
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content.trim() }],
      }));

    // Ensure the conversation passed to Gemini starts with a user turn
    let contents = cleanMessages;
    while (contents.length > 0 && contents[0].role === 'model') {
      contents = contents.slice(1);
    }
    if (contents.length === 0) {
      contents = [{ role: 'user', parts: [{ text: 'Hello' }] }];
    }

    const response = await callGeminiWithFailover({
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || (isHi ? 'नमस्ते! मैं आपकी रसोई सहायता के लिए तैयार हूँ 🐝' : 'Hello Chef! KitchenBee AI is ready to help 🐝');
    res.json({ reply });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    const isHi = req.body?.language === 'hi';
    res.status(500).json({
      error: isHi
        ? 'किचनबी एआई सर्वर अभी व्यस्त है। कृपया कुछ पलों बाद पुनः संदेश भेजें।'
        : 'KitchenBee AI is experiencing high traffic right now. Please try again in a few moments.',
    });
  }
});

// Kitchen Problem Solver Endpoint
app.post('/api/solve-problem', async (req, res) => {
  const { problem = '', imageBase64, mimeType, language = 'en' } = req.body;
  const isHi = language === 'hi';

  try {
    if (!problem && !imageBase64) {
      return res.status(400).json({ error: 'Problem description or image is required' });
    }

    const systemInstruction = `You are the Kitchen Problem Solver module of KitchenBee AI ("Buzzing with Smart Kitchen Ideas!").
The user has an immediate cooking mishap or kitchen dilemma.

==================================================
CRITICAL MANDATORY LANGUAGE DIRECTIVE:
The user has set the application language to: "${isHi ? 'HINDI (हिंदी)' : 'ENGLISH'}".
You MUST generate your ENTIRE output strictly in ${isHi ? 'natural, clear Hindi written in Devanagari script (हिंदी)' : 'simple, friendly English'}.
STRICT RULE: Even if the user enters their question in English (e.g. "My curry is watery") or Hinglish (e.g. "sabzi me namak jyada ho gaya"), because the app language is ${isHi ? 'HINDI' : 'ENGLISH'}, ALL titles, headings, explanations, steps, and tips MUST BE IN ${isHi ? 'HINDI (हिंदी)' : 'ENGLISH'}.
Do NOT output English paragraphs when language is HINDI.
==================================================

OUTPUT STRUCTURE IN ${isHi ? 'HINDI' : 'ENGLISH'}:
${
  isHi
    ? `- 🔍 **समस्या की पहचान और कारण** (Why this happened)
- ⚡ **तुरंत उपाय (Emergency Fix)** (Right now step-by-step action)
- 🛡️ **भविष्य के लिए सुझाव** (How to prevent this in the future)
- ⚠️ **खाद्य सुरक्षा और स्वच्छता चेतावनी** (Food safety alert if spoilage, bacteria, or temperature danger zones are involved)`
    : `- 🔍 **Problem Diagnosis & Likely Cause** (Why this happened)
- ⚡ **Immediate Emergency Fix** (Step-by-step action to take right now)
- 🛡️ **Prevention Tip for Next Time** (How to prevent this in the future)
- ⚠️ **Food Safety & Hygiene Alert** (If there is spoilage, bacterial risk, or temperature danger zone 40°F-140°F)`
}

If the user's question is truly vague (e.g. only typed "food bad"), provide the top 2 common interpretations and ask a friendly 1-sentence follow-up question in ${isHi ? 'Hindi' : 'English'}.
Keep tone warm, reassuring, and beginner-friendly.`;

    const parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }
    parts.push({
      text: problem ? `Kitchen Problem: "${problem}"` : (isHi ? 'कृपया इस भोजन की फोटो देखकर बताएं कि क्या गड़बड़ हुई है और इसे कैसे ठीक करें।' : 'Please analyze this food photo and tell me what is wrong and how to fix it.'),
    });

    const response = await callGeminiWithFailover({
      contents: { parts },
      config: {
        systemInstruction,
      },
    });

    res.json({ solution: response.text });
  } catch (error: any) {
    console.warn('Problem Solver upstream fallback triggered:', error?.message);
    const fallbackSolution = getEmergencyFallbackSolution(problem, language);
    res.json({ solution: fallbackSolution });
  }
});

// AI Recipe Search & Generator Endpoint
app.post('/api/generate-recipe', async (req, res) => {
  const { dishName, cuisine, dietary, language = 'en' } = req.body;
  const isHi = language === 'hi';

  try {
    if (!dishName) {
      return res.status(400).json({ error: 'Dish name is required' });
    }

    const systemInstruction = `You are KitchenBee AI's Master Recipe Generator.
Generate a complete, delicious, beginner-friendly recipe in JSON format for the requested dish.
Support Indian (North, South, Street Food, Snacks, Desserts), International (Italian, Chinese, Mexican, Thai, Continental), and Bakery/Confectionery (Cakes, Cookies, Breads, Pastries, Muffins, Pizza).
Honor dietary preferences (${dietary || 'Any'}).

==================================================
CRITICAL MANDATORY LANGUAGE DIRECTIVE:
The user has set the application language to: "${isHi ? 'HINDI (हिंदी)' : 'ENGLISH'}".
Every single field in the JSON output MUST BE IN ${isHi ? 'HINDI (हिंदी - Devanagari script)' : 'ENGLISH'}:
- "name": ${isHi ? 'Hindi dish name in Devanagari (e.g. "वेजिटेबल पुलाव", "आलू पराठा", "चॉकलेट केक")' : 'English dish name'}
- "nameHi": Hindi dish name
- "category": ${isHi ? 'Hindi category (e.g. "सब्जी और करी", "नाश्ता", "बेकरी", "स्नैक्स")' : 'Category'}
- "prepTime": ${isHi ? '"15 मिनट"' : '"15 mins"'}
- "cookTime": ${isHi ? '"25 मिनट"' : '"25 mins"'}
- "difficulty": ${isHi ? '"सरल" or "मध्यम" or "कठिन"' : '"Easy" | "Medium" | "Hard"'}
- "description": ${isHi ? 'Complete description written 100% in Hindi (Devanagari)' : 'English description'}
- "ingredients": Array where EVERY ingredient "name" is in ${isHi ? 'Hindi (Devanagari script, e.g. "बासमती चावल (Basmati Rice)", "पनीर (Paneer)", "मक्खन", "नमक")' : 'English'}, and "unit" is standard.
- "instructions": Array where EVERY cooking step is written 100% in ${isHi ? 'clean, natural Hindi (Devanagari script)' : 'English'}!
- "tips": Written in ${isHi ? 'Hindi (Devanagari)' : 'English'}!
Do NOT output English sentences or English steps when the language is HINDI!
==================================================

Output must be valid JSON strictly matching this structure:
{
  "name": "Dish Name",
  "nameHi": "डिश का नाम",
  "category": "Category",
  "prepTime": "15 mins",
  "cookTime": "25 mins",
  "difficulty": "Easy",
  "baseServings": 4,
  "description": "Short engaging description of the dish",
  "isVegetarian": true,
  "ingredients": [
    { "name": "Ingredient name", "amount": 200, "unit": "g" }
  ],
  "instructions": [
    "Step 1...",
    "Step 2..."
  ],
  "tips": "Chef tip"
}
Ensure numeric amount values are numbers, not strings.`;

    const prompt = `Generate recipe for: "${dishName}". ${cuisine ? `Cuisine style: ${cuisine}.` : ''} ${dietary ? `Dietary requirement: ${dietary}.` : ''}`;

    const response = await callGeminiWithFailover({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error: any) {
    console.error('Recipe Generator API Error:', error);
    const dish = req.body.dishName || 'Chef Special';
    res.json({
      name: isHi ? `${dish} (विशेष रेसिपी)` : dish,
      nameHi: dish,
      category: isHi ? 'शेफ स्पेशल' : 'Chef Special',
      categoryHi: 'शेफ स्पेशल',
      prepTime: isHi ? '15 मिनट' : '15 mins',
      cookTime: isHi ? '20 मिनट' : '20 mins',
      difficulty: isHi ? 'सरल' : 'Easy',
      baseServings: 4,
      description: isHi
        ? `स्वादिष्ट, पौष्टिक और झटपट तैयार होने वाला ${dish}। यह शुरुआती रसोइयों के लिए बेहद आसान है।`
        : `A delicious, comforting version of ${dish} tailored for everyday home cooking.`,
      isVegetarian: req.body.dietary === 'Vegetarian',
      ingredients: [
        { name: isHi ? 'मुख्य सामग्री (Primary Ingredient)' : 'Primary Ingredient', amount: 300, unit: isHi ? 'ग्राम' : 'g' },
        { name: isHi ? 'कुकिंग ऑयल या मक्खन' : 'Cooking Oil or Butter', amount: 2, unit: isHi ? 'बड़ा चम्मच' : 'tbsp' },
        { name: isHi ? 'बारीक कटा प्याज व लहसुन' : 'Garlic & Onion', amount: 1, unit: isHi ? 'पीस' : 'pcs' },
        { name: isHi ? 'नमक व मसाले' : 'Salt & Seasoning', amount: 1.5, unit: isHi ? 'छोटा चम्मच' : 'tsp' },
      ],
      instructions: isHi
        ? [
            'मुख्य सामग्री को पानी से धोकर साफ और एक समान टुकड़ों में काट लें।',
            'कड़ाही में तेल या घी गरम करें, प्याज-लहसुन डालकर सुनहरा होने तक भूनें और मुख्य सामग्री मिलाएं।',
            'धीमी आंच पर 15-20 मिनट तक पकाएं जब तक सामग्री नरम न हो जाए। नमक चखकर गरमा-गरम परोसें।',
          ]
        : [
            'Prep and chop your primary ingredients cleanly.',
            'Heat oil in a skillet, sauté aromatics, and add main ingredients.',
            'Simmer until tender and fragrant, adjust salt to taste, and serve warm.',
          ],
      tips: isHi ? 'धीमी आंच पर ढककर पकाने से मसालों का स्वाद अंदर तक समा जाता है।' : 'Simmering gently on medium-low flame locks in flavors beautifully.',
    });
  }
});

// Explore Ingredients Endpoint
app.post('/api/explore-ingredients', async (req, res) => {
  const { ingredients, vegetarianOnly = false, language = 'en', batch = 1 } = req.body;
  const isHi = language === 'hi';

  try {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients list is required' });
    }

    const systemInstruction = `You are KitchenBee AI's Expert Pantry Explorer.
Given ANY list of available ingredients in the user's kitchen, your golden rule is:
NEVER return "Recipe Not Found" and NEVER return an empty list. Always provide 3 to 4 wonderful, practical, beginner-friendly dish suggestions.

==================================================
CRITICAL MANDATORY LANGUAGE DIRECTIVE:
The user's active interface language is: "${isHi ? 'HINDI (हिंदी)' : 'ENGLISH'}".
When language is HINDI:
- "dishName" MUST BE IN HINDI (Devanagari script, e.g. "आलू प्याज की सूखी सब्जी", "मसाला पुलाव").
- "description" MUST BE 100% IN HINDI.
- "usedIngredients" MUST BE IN HINDI (e.g. "आलू", "टमाटर").
- "missingIngredients" MUST BE IN HINDI (e.g. "कुकिंग ऑयल", "जीरा व नमक").
- "cookTime" MUST BE IN HINDI (e.g. "15 मिनट").
- "difficulty" MUST BE IN HINDI ("सरल" / "मध्यम").
- "quickInstructions" EVERY SINGLE STEP MUST BE 100% IN HINDI (Devanagari).
- "alternativeDishes" MUST BE IN HINDI.
Do NOT return English instructions or English descriptions when interface is HINDI!
==================================================

RULES FOR SUGGESTIONS:
1. Prioritize dishes that use the maximum number of the user's selected ingredients.
2. If some ingredients are missing (e.g. oil, basic spices, water, flour), clearly separate:
   - "usedIngredients": the items from the user's list.
   - "missingIngredients": simple pantry essentials or extra items needed to complete the dish.
3. If the user's ingredient combination is quirky or sparse (e.g. only 1 or 2 items like "Rice" or "Bread and Milk"), suggest creative staple recipes that celebrate those ingredients (e.g. Jeera Rice, Curd Rice, Kheer, Bread Toast, French Toast, Shahi Tukda).
4. Provide alternative dishes in the "alternativeDishes" array.
${vegetarianOnly ? 'STRICT REQUIREMENT: All suggested recipes must be 100% PURE VEGETARIAN.' : ''}
${batch > 1 ? `Provide a FRESH alternative set of dishes (Batch #${batch}) different from obvious common dishes.` : ''}

Return JSON strictly with the following schema:
{
  "suggestions": [
    {
      "dishName": "Name of Dish",
      "dishNameHi": "डिश का नाम",
      "matchPercentage": 90,
      "description": "Brief description of the dish and why it works with these ingredients",
      "usedIngredients": ["ingredient1", "ingredient2"],
      "missingIngredients": ["common pantry item like oil, salt, cumin"],
      "cookTime": "20 mins",
      "difficulty": "Easy",
      "isVegetarian": true,
      "category": "Quick Meal",
      "alternativeDishes": ["Alternative Dish 1", "Alternative Dish 2"],
      "quickInstructions": [
        "Step 1...",
        "Step 2..."
      ]
    }
  ]
}`;

    const prompt = `Available ingredients: [${ingredients.join(', ')}]. Vegetarian Only: ${vegetarianOnly}. Batch: ${batch}. Language: ${isHi ? 'Hindi' : 'English'}.`;

    const response = await callGeminiWithFailover({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"suggestions":[]}');
    
    // Safety check: If suggestions array is empty, provide dynamic fallback recipes
    if (!parsed.suggestions || parsed.suggestions.length === 0) {
      parsed.suggestions = [
        {
          dishName: isHi ? 'क्विक किचन सॉते (सब्जी फ्राई)' : 'Quick Kitchen Stir-Fry',
          dishNameHi: 'क्विक किचन सॉते',
          matchPercentage: 85,
          description: isHi
            ? 'आपकी उपलब्ध सामग्री से बना झटपट, पौष्टिक और स्वादिष्ट घरेलू व्यंजन।'
            : 'A wholesome, delicious meal prepared easily with your available pantry ingredients.',
          usedIngredients: ingredients.slice(0, 3),
          missingIngredients: isHi ? ['कुकिंग ऑयल', 'नमक और काली मिर्च'] : ['Cooking Oil', 'Salt & Pepper'],
          cookTime: isHi ? '15 मिनट' : '15 mins',
          difficulty: isHi ? 'सरल' : 'Easy',
          isVegetarian: vegetarianOnly,
          category: isHi ? 'झटपट भोजन' : 'Quick Meal',
          alternativeDishes: isHi ? ['पैन फ्राइड राइस', 'मसालेदार वेजी रोस्ट'] : ['Pantry Fried Rice', 'Spiced Veggie Hash'],
          quickInstructions: isHi
            ? [
                'कड़ाही में 1 चम्मच तेल गरम करें और अपनी उपलब्ध सामग्री डालें।',
                'हल्का नमक और मसाले डालकर मध्यम आंच पर 8-10 मिनट भूनें और गरमा-गरम परोसें।',
              ]
            : [
                'Heat oil in a skillet and add your primary ingredients.',
                'Season with salt and pepper, sauté for 8-10 minutes until tender and serve hot.',
              ],
        },
      ];
    }

    res.json(parsed);
  } catch (error: any) {
    console.warn('Explore Ingredients upstream fallback triggered:', error?.message);
    const primary = req.body.ingredients?.[0] || (isHi ? 'रसोई सामग्री' : 'Kitchen Ingredients');
    res.json({
      suggestions: [
        {
          dishName: isHi ? `${primary} स्पेशल होमस्टाइल डिश` : `Comforting ${primary} Medley`,
          dishNameHi: `${primary} स्पेशल डिश`,
          matchPercentage: 90,
          description: isHi
            ? 'आपकी चुनी हुई सामग्री से तैयार होने वाला एक बेहद स्वादिष्ट और आसान घरेलू व्यंजन।'
            : 'A simple, comforting skillet dish crafted effortlessly from your selected ingredients.',
          usedIngredients: req.body.ingredients || ['Primary Item'],
          missingIngredients: isHi ? ['नमक', 'कुकिंग ऑयल'] : ['Salt', 'Cooking Oil'],
          cookTime: isHi ? '15 मिनट' : '15 mins',
          difficulty: isHi ? 'सरल' : 'Easy',
          isVegetarian: req.body.vegetarianOnly ?? true,
          category: isHi ? 'घरेलू डिश' : 'Homestyle',
          alternativeDishes: isHi ? ['मसाला रोस्ट', 'तवा फ्राई'] : ['Savory Skillet', 'Spiced Roast'],
          quickInstructions: isHi
            ? [
                'पैन में 1 चम्मच तेल या घी गरम करें।',
                'उपलब्ध सामग्री डालकर नमक और पसंदीदा मसाले मिलाएं।',
                'मध्यम आंच पर 8-10 मिनट पकाएं और आनंद लें।',
              ]
            : [
                'Heat a little oil or butter in a pan.',
                'Toss in your available ingredients, season with salt and spices.',
                'Cook on medium heat until tender and enjoy warm.',
              ],
        },
      ],
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'KitchenBee AI', version: '1.3.0' });
});

// Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐝 KitchenBee AI Server buzzing at http://0.0.0.0:${PORT}`);
  });
}

startServer();
