import { GoogleGenAI, Chat } from "@google/genai";
import { GEMINI_MODEL } from "../constants";

// Retrieve the API Key injected by Vite
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("CRITICAL ERROR: API Key is missing. Please check your .env file.");
} else {
  // Safe log to confirm key presence without exposing it entirely
  console.log("API Key loaded successfully:", apiKey.substring(0, 5) + "...");
}

// Initialize the client. Use a fallback empty string to prevent constructor crash 
// if key is missing (logs will show the real error above).
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Rate Limiting Logic
const RATE_LIMIT_KEY = 'fight_arcade_rate_limit';
const MAX_REQUESTS_PER_MINUTE = 10;
const TIME_WINDOW_MS = 60000; // 1 Minute

const checkRateLimit = () => {
  const now = Date.now();
  const rawData = localStorage.getItem(RATE_LIMIT_KEY);
  let timestamps: number[] = rawData ? JSON.parse(rawData) : [];

  // Filter out timestamps older than the time window
  timestamps = timestamps.filter(t => now - t < TIME_WINDOW_MS);

  // Check if limit is exceeded
  if (timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error(`⚠️ Limite de tráfego atingido. Por favor, aguarde alguns instantes antes de enviar nova mensagem. (Máx: ${MAX_REQUESTS_PER_MINUTE}/min)`);
  }

  // Add new timestamp
  timestamps.push(now);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
};

// Updated Welcome Text with Local Video Marker, Backup Link, Canva Link, and Instruction
export const FIGHT_ARCADE_WELCOME_TEXT = `[VIDEO_LOCAL]
https://www.fightarcade.com.br/videomanual
https://www.canva.com/design/DAFB8VIBPXU/xyySxdmR19FY8lknZ3gJLg/watch

Caso o seu seja outro modelo, é só acionar o suporte e explicar para a pessoa.

Olá! 👋 Sou seu assistente virtual da Fight Arcade e vou te ajudar a encontrar tudo o que precisa.
Visite nosso site: https://www.fightarcade.com.br

Para começarmos, me diga o que você gostaria de fazer:

1️⃣ - Ver modelos e preços
2️⃣ - Ver opções de estampas
3️⃣ - Suporte Técnico
4️⃣ - Finalizar compra
5️⃣ - Falar com um atendente`;

const FIGHT_ARCADE_KNOWLEDGE = {
  "menu_principal_texto": FIGHT_ARCADE_WELCOME_TEXT,
  "default_reply": "Desculpe, não entendi sua solicitação. Por favor, escolha uma das opções ou digite *0* para voltar ao início.",
  "rules": [
    {
      "keywords": ["oi", "ola", "olá", "eai", "tudo bem", "menu", "início", "start", "voltar", "sair", "0"],
      "reply": FIGHT_ARCADE_WELCOME_TEXT,
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["1"],
      "reply": "Legal! Para começar, me diga o que você procura (digite *P + o número*):\n\nP1 - Fliperama Completo (com jogos)\nP2 - Apenas Controle USB (para PC)",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1"],
      "reply": "Certo, Fliperama! E você precisa para quantos jogadores (digite *P1 + o número*)?\n\nP1-1 - Para 1 Jogador\nP1-2 - Para 2 Jogadores",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p2"],
      "reply": "Certo, Controle USB! E você precisa para quantos jogadores (digite *P2 + o número*)?\n\nP2-1 - Para 1 Jogador\nP2-2 - Para 2 Jogadores",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-1"],
      "reply": "Ótimo! E qual material você prefere para o seu fliperama de 1 jogador (digite *P1-1 + o número*)?\n\nP1-1-1 - MDF (Clássico)\nP1-1-2 - Metal (Ultra Resistente)",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-2"],
      "reply": "Ótimo! E qual material você prefere para o seu fliperama de 2 jogadores (digite *P1-2 + o número*)?\n\nP1-2-1 - MDF (Clássico)\nP1-2-2 - Metal (Ultra Resistente)",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-1-1"],
      "reply": "Excelente! Aqui estão os preços para *Fliperama de 1 Jogador em MDF*:\n\n- *Comando Mecânico:* R$ 499\n- *Comando Óptico:* R$ 550\n\nO que você gostaria de fazer agora?\n\nC1 - Comprar Online (Mercado Livre/Shopee)\n5 - Falar com um atendente\n\nOu digite *0* para voltar ao início.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-1-2"],
      "reply": "Excelente! Aqui estão os preços para *Fliperama de 1 Jogador em Metal*:\n\n- *Comando Mecânico:* R$ 599\n- *Comando Óptico:* R$ 650\n\nO que você gostaria de fazer agora?\n\nC1 - Comprar Online (Mercado Livre/Shopee)\n5 - Falar com um atendente\n\nOu digite *0* para voltar ao início.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-2-1"],
      "reply": "Excelente! Aqui estão os preços para *Fliperama de 2 Jogadores em MDF*:\n\n- *Comando Mecânico:* R$ 599\n- *Comando Óptico:* R$ 699\n\nO que você gostaria de fazer agora?\n\nC1 - Comprar Online (Mercado Livre/Shopee)\n5 - Falar com um atendente\n\nOu digite *0* para voltar ao início.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-2-2"],
      "reply": "Excelente! Aqui estão os preços para *Fliperama de 2 Jogadores em Metal*:\n\n- *Comando Mecânico:* R$ 699\n- *Comando Óptico:* R$ 799\n\nO que você gostaria de fazer agora?\n\nC1 - Comprar Online (Mercado Livre/Shopee)\n5 - Falar com um atendente\n\nOu digite *0* para voltar ao início.",
      "image_url": "https://www.fightarcade.com.br/metal/WhatsAppImage2025-06-10at06.18.45.jpeg",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p2-1"],
      "reply": "Excelente! Preços para *Controle USB de 1 Jogador*:\n\n**Gabinete em MDF:**\n- Mecânico: R$ 299\n- Óptico: R$ 350\n- Óptico Pico (Latência Mínima): R$ 450\n\n**Gabinete em Metal:**\n- Mecânico: R$ 399\n- Óptico: R$ 450\n\nO que você gostaria de fazer agora?\n\nC1 - Comprar Online (Mercado Livre/Shopee)\n5 - Falar com um atendente\n\nOu digite *0* para voltar ao início.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p2-2"],
      "reply": "Excelente! Preços para *Controle USB de 2 Jogadores*:\n\n**Gabinete em MDF:**\n- Mecânico: R$ 499\n- Óptico: R$ 599\n\n**Gabinete em Metal:**\n- Mecânico: R$ 650\n- Óptico: R$ 750\n\nO que você gostaria de fazer agora?\n\nC1 - Comprar Online (Mercado Livre/Shopee)\n5 - Falar com um atendente\n\nOu digite *0* para voltar ao início.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["2", "estampas"],
      "reply": "A personalização é a parte mais divertida! Você pode escolher entre dezenas de estampas.\n\nVeja todas as opções em nosso catálogo online aqui:\n👾 https://acesse.one/fightarcadeestampa\n\nCaso prefira, você também pode enviar sua própria arte em alta resolução. Posso ajudar com algo mais?",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["3", "problema", "ajuda", "suporte", "nao funciona"],
      "reply": "Entendo que precisa de ajuda. Visite nosso site oficial para novidades e produtos: https://www.fightarcade.com.br\n\nPara selecionar uma opção de suporte, digite *S + o número* (Exemplo: S1).\n\nS1 - Comando não funciona\nS2 - Comando andando sozinho\nS3 - Botões não funcionam\nS4 - Fliperama não liga\nS5 - Como alterar configurações dos botões\nS6 - Como adicionar mais jogos\nS7 - Como instalar um controle adicional (USB/Sem Fio)\nS8 - Guias e Manuais\n\nPara voltar ao menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["4"],
      "reply": "Que ótimo! Para finalizar sua compra, digite *C + o número* da opção:\n\nC1 - Comprar Online (Mercado Livre / Shopee)\nC2 - Finalizar com Atendente (Entrega Expressa)",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["5", "atendente", "falar com alguem", "humano", "falar com atendente"],
      "reply": "Nossos especialistas já foram notificados e logo irão te responder nos WhatsApps:\n\n📱 [(11) 97898-4413](https://wa.me/5511978984413)\n📱 [(11) 98812-1976](https://wa.me/5511988121976)\n\nℹ️ *Nota Importante:* Os controles só podem ser alterados **dentro dos jogos** e não fora, pois é uma configuração geral.\n\n*O assistente virtual será pausado para não atrapalhar a conversa.* Para reativá-lo a qualquer momento, basta digitar *0*. 🙂",
      "pause_bot_after_reply": true
    },
    {
      "keywords": ["c1", "comprar online"],
      "reply": "Perfeito! Você pode comprar com toda a segurança em nossas lojas oficiais:\n\n🛒 *Mercado Livre:* https://lista.mercadolivre.com.br/pagina/fightarcade\n🛍️ *Shopee:* https://shopee.com.br/laradecor\n\nDigite *0* se precisar de algo mais.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["c2", "finalizar com atendente"],
      "reply": "Ótima escolha! Comprando diretamente conosco (WhatsApp [11 98812-1976](https://wa.me/5511988121976)), temos vantagens como produção em 3-4 horas e entrega rápida por motoboy. Nossos especialistas já foram notificados.\n\n*O assistente virtual será pausado para não atrapalhar.* Para reativá-lo, basta digitar *0*. 🙂",
      "pause_bot_after_reply": true
    },
    {
      "keywords": ["s1"],
      "reply": "Ok, para *comando que não funciona*:\n1. Verifique os fios na parte traseira, algum pode ter soltado.\n2. Com o fliperama ligado, veja se a placa principal tem um LED aceso.\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["s2"],
      "reply": "Certo, para *comando andando sozinho*: se for MECÂNICO, uma micro-switch pode estar desalinhada. Se for ÓPTICO, pode ser interferência de luz. Nosso vídeo manual mostra como ajustar: www.fightarcade.com.br/videomanual\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["s3"],
      "reply": "Ok, se os *botões não funcionam*, geralmente é um fio solto. Abra a tampa traseira com cuidado e verifique a conexão na placa 'zero delay'. O vídeo manual pode te ajudar.\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["s4"],
      "reply": "Se o *fliperama não liga*, primeiro teste a tomada e o cabo. Se suspeita da fonte, peça para 'falar com um atendente' (opção 5 do menu).\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["s5"],
      "reply": "Para *alterar a configuração dos botões*, você deve fazer isso dentro de cada jogo. Nosso guia mostra como: https://sl1nk.com/alterarbotoesdentrodojogo\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["s6"],
      "reply": "Sim, é possível *adicionar ou remover jogos*. Temos um tutorial completo: https://sl1nk.com/adicionarouremoverjogos. *Atenção:* Se feito de forma incorreta, pode danificar o sistema.\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["s7"],
      "reply": "Para *instalar e configurar um controle adicional*:\n\n1. O sistema é baseado em **Linux**, tornando-o **Plug and Play** com a maioria dos controles USB do mercado.\n2. **Dica:** Recomendamos controles **Sem Fio (Wireless)** que possuam **dongle USB**, para maior liberdade e facilidade de instalação.\n3. Basta conectar o dongle/cabo na porta USB externa e configurar dentro do menu do sistema (Start > Configurar Controle).\n\nGuia passo a passo: https://sl1nk.com/configurarcontrolesnovos\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["s8"],
      "reply": "Claro! Nossos guias principais são:\n\n📄 *Manual em Texto:* https://l1nq.com/manualfightarcade\n📹 *Manual em Vídeo:* www.fightarcade.com.br/videomanual\n\nVisite nosso site: https://www.fightarcade.com.br\n\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["placas", "componentes", "desempenho", "lag", "pico", "sanwa", "zero delay"],
      "reply": "Você está procurando por máxima performance! Nossos controles são configurados com as melhores peças:\n\n- *Placa Pico (RP2040):* O coração dos nossos controles. Latência de menos de 1 milissegundo (input lag), ideal para competição. Mais detalhes: https://www.fightarcade.com.br/pico1/\n- *Comando Óptico vs. Mecânico:* O comando mecânico usa peças físicas (micro-switches). O óptico usa sensores de luz, garantindo mais precisão e durabilidade.\n- *Componentes Premium:* Oferecemos peças de marcas como Sanwa e Seimitsu. Entre em contato com um atendente para um orçamento.\n\nPosso ajudar com algo mais?",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["pagamento", "pagar", "parcelamento", "pix", "boleto", "cartao", "lojista", "revenda", "atacado", "desconto"],
      "reply": "💰 **Formas de Pagamento:**\n- Cartão de Crédito (parcelado em até 12x)\n- PIX (geralmente com desconto)\n- Boleto Bancário\n\n🏢 **Lojistas e Revenda:**\nTemos condições especiais e descontos progressivos para compras em atacado. Fale com nosso atendente no WhatsApp [11 98812-1976](https://wa.me/5511988121976) para solicitar a tabela de revenda.\n\nPosso ajudar com algo mais?",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["garantia", "devolucao", "defeito", "arrependimento", "troca"],
      "reply": "Oferecemos 1 ano de garantia para nossas placas controladoras e 90 dias para os demais componentes contra defeitos de fabricação. A devolução por arrependimento é de até 7 dias corridos após o recebimento. Posso ajudar com algo mais?",
      "pause_bot_after_reply": false
    }
  ]
};

const SYSTEM_INSTRUCTION = `Você é a "Arcade Master", uma IA especialista em fliperamas e assistente da empresa "Fight Arcade". Sua personalidade é amigável e prestativa.

Suas regras de resposta são:
1.  **PRIORIDADE MÁXIMA:** Para perguntas sobre preços, garantia, frete e modelos específicos da Fight Arcade, você DEVE usar APENAS a informação da "BASE DE CONHECIMENTO DA EMPRESA" fornecida abaixo. Esta é sua fonte de verdade absoluta para dados da empresa.
2.  **CONHECIMENTO GERAL:** Se a pergunta for sobre o universo arcade em geral (peças como Sanwa, sistemas como Pandory, história dos jogos, etc.) e a resposta NÃO estiver na base de conhecimento da empresa, você TEM PERMISSÃO para usar seu conhecimento geral de especialista para dar uma resposta completa e informativa.
3.  **CONVERSA CASUAL:** Cumprimente os usuários de volta e mantenha uma conversa amigável.
4.  **FORA DO TÓPICO:** Se a pergunta não tiver relação nenhuma com arcades ou com a Fight Arcade, responda educadamente que você só pode ajudar com esses assuntos.

--- BASE DE CONHECIMENTO DA EMPRESA ---
${JSON.stringify(FIGHT_ARCADE_KNOWLEDGE, null, 2)}
--- FIM DA BASE DE CONHECIMENTO ---`;

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  try {
    // Perform Rate Limit Check before calling API
    checkRateLimit();

    return await chat.sendMessageStream({ message });
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};