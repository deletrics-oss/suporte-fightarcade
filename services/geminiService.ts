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

1️⃣ - Ver modelos de Fliperama e Controles
2️⃣ - Ver opções de estampas
3️⃣ - Suporte Técnico
4️⃣ - Finalizar compra
5️⃣ - Falar com um atendente
6️⃣ - Placas e Componentes (Novo)`;

const FIGHT_ARCADE_KNOWLEDGE = {
  "menu_principal_texto": FIGHT_ARCADE_WELCOME_TEXT,
  "default_reply": "Desculpe, não entendi sua solicitação. Por favor, escolha uma das opções ou digite *0* para voltar ao início.",
  "links_e_recursos_completos": {
    "manuais_e_ajuda": {
      "manual_texto_geral": "https://www.fightarcade.com.br/manual",
      "manual_video": "https://www.fightarcade.com.br/videomanual",
      "manual_pico_rp2040": "https://www.fightarcade.com.br/manual-pico",
      "arquivos_driver_imgs": "https://www.fightarcade.com.br/files",
      "banco_imagens_sistema": "https://www.fightarcade.com.br/images",
      "pack_3d_artes": "https://www.fightarcade.com.br/3dpacksite",
      "solucao_erro_rp2040": "https://www.fightarcade.com.br/rp2040-fight-arcade%20ERRO",
      "solucao_erro_site_rp2040": "https://www.fightarcade.com.br/rp2040-fight-arcade-site%20ERRO"
    },
    "placas_e_eletronica": {
      "catalogo_placas": "https://www.fightarcade.com.br/PLACAS",
      "pico_series": {
        "pico_geral": "https://www.fightarcade.com.br/pico",
        "pico_v1": "https://www.fightarcade.com.br/pico1",
        "pico_v2": "https://www.fightarcade.com.br/pico2",
        "pico_mini": "https://www.fightarcade.com.br/picomini",
        "rp2040_infos": "https://www.fightarcade.com.br/rp2040-fight-arcade",
        "rp2040_optica": "https://www.fightarcade.com.br/rp2040optica"
      },
      "zero_delay_series": {
        "zero_324_arduino": "https://www.fightarcade.com.br/zero324",
        "zero_8a": "https://www.fightarcade.com.br/zero8a",
        "zero_stm32": "https://www.fightarcade.com.br/zerostm32",
        "zero_duplo": "https://www.fightarcade.com.br/zeroduplo",
        "placas_diversas": "https://www.fightarcade.com.br/sitesplacas"
      },
      "sem_fio": "https://www.fightarcade.com.br/wire"
    },
    "comandos_e_botoes": {
      "comando_geral": "https://www.fightarcade.com.br/comando",
      "microswitch_comando": "https://www.fightarcade.com.br/comandosw",
      "tecnologia_optica": {
        "placa_optica_avulsa": "https://www.fightarcade.com.br/placa-optica-comando",
        "kit_sanwa": "https://www.fightarcade.com.br/sanwa",
        "botao_optico": "https://www.fightarcade.com.br/botaooptico",
        "optojoy": "https://www.fightarcade.com.br/optojoy"
      }
    },
    "modelos_fliperama": {
      "modelos_fight": ["https://www.fightarcade.com.br/fight", "https://www.fightarcade.com.br/fight1"],
      "modelo_fliper": "https://www.fightarcade.com.br/fliper",
      "materiais": {
        "mdf": "https://www.fightarcade.com.br/mdf",
        "metal": ["https://www.fightarcade.com.br/metal", "https://www.fightarcade.com.br/metl"]
      },
      "modelos_duplos": ["https://www.fightarcade.com.br/dupla", "https://www.fightarcade.com.br/duplo", "https://www.fightarcade.com.br/duplonova"],
      "portateis": {
        "game_stick": "https://www.fightarcade.com.br/gamestick",
        "linha_home": "https://www.fightarcade.com.br/inhome"
      },
      "acessorios": {
        "oculos_vr": "https://www.fightarcade.com.br/oculos"
      }
    },
    "institucional_e_parceiros": {
      "site_oficial": ["https://www.fightarcade.com.br/site", "https://www.fightarcade.com.br/11"],
      "politica_privacidade": "https://www.fightarcade.com.br/politica-de-privacidade",
      "parceiro_print_unha": ["https://www.fightarcade.com.br/printunha", "https://www.fightarcade.com.br/printunha%20backup"],
      "parceiro_vasos": "https://www.fightarcade.com.br/vasos.site"
    }
  },
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
      "reply": "Certo, Fliperama! E você precisa para quantos jogadores (digite *P1 + o número*)?\n\nP1-1 - Para 1 Jogador\nP1-2 - Para 2 Jogadores\n\n👀 Veja modelos duplos aqui: https://www.fightarcade.com.br/dupla",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p2"],
      "reply": "Certo, Controle USB! E você precisa para quantos jogadores (digite *P2 + o número*)?\n\nP2-1 - Para 1 Jogador\nP2-2 - Para 2 Jogadores",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-1"],
      "reply": "Ótimo! E qual material você prefere para o seu fliperama de 1 jogador (digite *P1-1 + o número*)?\n\nP1-1-1 - MDF (Clássico) - Mais detalhes: https://www.fightarcade.com.br/mdf\nP1-1-2 - Metal (Ultra Resistente) - Mais detalhes: https://www.fightarcade.com.br/metal",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-2"],
      "reply": "Ótimo! E qual material você prefere para o seu fliperama de 2 jogadores (digite *P1-2 + o número*)?\n\nP1-2-1 - MDF (Clássico) - Mais detalhes: https://www.fightarcade.com.br/mdf\nP1-2-2 - Metal (Ultra Resistente) - Mais detalhes: https://www.fightarcade.com.br/metal",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-1-1"],
      "reply": "Excelente! Aqui estão os preços para *Fliperama de 1 Jogador em MDF*:\n\n- *Comando Mecânico:* R$ 499 (https://www.fightarcade.com.br/comando)\n- *Comando Óptico:* R$ 550 (https://www.fightarcade.com.br/placa-optica-comando)\n\nO que você gostaria de fazer agora?\n\nC1 - Comprar Online (Mercado Livre/Shopee)\n5 - Falar com um atendente\n\nOu digite *0* para voltar ao início.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-1-2"],
      "reply": "Excelente! Aqui estão os preços para *Fliperama de 1 Jogador em Metal*:\n\n- *Comando Mecânico:* R$ 599\n- *Comando Óptico:* R$ 650\n\nℹ️ Veja a robustez do metal: https://www.fightarcade.com.br/metal\n\nO que você gostaria de fazer agora?\n\nC1 - Comprar Online (Mercado Livre/Shopee)\n5 - Falar com um atendente\n\nOu digite *0* para voltar ao início.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-2-1"],
      "reply": "Excelente! Aqui estão os preços para *Fliperama de 2 Jogadores em MDF*:\n\n- *Comando Mecânico:* R$ 599\n- *Comando Óptico:* R$ 699\n\nO que você gostaria de fazer agora?\n\nC1 - Comprar Online (Mercado Livre/Shopee)\n5 - Falar com um atendente\n\nOu digite *0* para voltar ao início.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p1-2-2"],
      "reply": "Excelente! Aqui estão os preços para *Fliperama de 2 Jogadores em Metal*:\n\n- *Comando Mecânico:* R$ 699\n- *Comando Óptico:* R$ 799\n\nℹ️ Veja a robustez do metal: https://www.fightarcade.com.br/metal\n\nO que você gostaria de fazer agora?\n\nC1 - Comprar Online (Mercado Livre/Shopee)\n5 - Falar com um atendente\n\nOu digite *0* para voltar ao início.",
      "image_url": "https://www.fightarcade.com.br/metal/WhatsAppImage2025-06-10at06.18.45.jpeg",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["p2-1"],
      "reply": "Excelente! Preços para *Controle USB de 1 Jogador*:\n\n**Gabinete em MDF:**\n- Mecânico: R$ 299\n- Óptico: R$ 350\n- Óptico Pico (Latência Mínima): R$ 450 (https://www.fightarcade.com.br/pico)\n\n**Gabinete em Metal:**\n- Mecânico: R$ 399\n- Óptico: R$ 450\n\nO que você gostaria de fazer agora?\n\nC1 - Comprar Online (Mercado Livre/Shopee)\n5 - Falar com um atendente\n\nOu digite *0* para voltar ao início.",
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
      "keywords": ["6", "placas", "componentes", "peças", "hardware"],
      "reply": "🛠️ *Menu de Placas e Componentes*\n\nSelecione o item para ver detalhes técnicos:\n\n*PL1* - Placa Pico Mini (RP2040) - Zero Delay\n*PL2* - Game Stick 4K Retro (+11.000 Jogos)\n*PL3* - Placa Óptica para Comando Sanwa\n*PL4* - Placa 324U Zero Delay (Arduino)\n*PL5* - Placa Wireless Fight Arcade\n\n*Outros Links Úteis:*\n- Placas Diversas: https://www.fightarcade.com.br/PLACAS\n- Peças Ópticas: https://www.fightarcade.com.br/botaooptico\n\nDigite o código (ex: *PL1*) para ver as especificações.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["pl1", "pico", "rp2040", "picomini"],
      "reply": "⚡ **Placa Pico Mini (RP2040)**\n\nVersão miniaturizada da placa Pico original. Projetada para latência ultra-baixa (sub-1ms) e performance de torneio.\n\n📄 **Especificações:**\n- Firmware: GP2040-CE\n- Latência: < 1 ms\n- Conexão: USB-C\n- Compatível com: PC, PS3, PS4 (Legacy), Switch, Android, Steam Deck.\n\n🔗 Mais detalhes e versões:\n- Pico Mini: https://www.fightarcade.com.br/picomini\n- Pico Padrão: https://www.fightarcade.com.br/pico\n- Manual Pico: https://www.fightarcade.com.br/manual-pico\n\nDigite *6* para voltar ao menu de placas ou *0* para o menu principal.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["pl2", "stick", "gamestick", "4k"],
      "reply": "🕹️ **Game Stick 4K Retro**\n\nConsole portátil HDMI Plug and Play com mais de 11.000 jogos clássicos e 2 controles sem fio.\n\n📄 **Sistemas:**\nArcade, Neo Geo, Capcom, SNES, Mega Drive, PS1, Game Boy, Atari e mais.\n\n⚙️ **Instalação:**\n1. Conecte na HDMI da TV.\n2. Ligue o USB na força.\n3. Conecte o receptor dos controles.\n\n🔗 Comprar/Detalhes: https://www.fightarcade.com.br/gamestick\n\nDigite *6* para voltar ao menu de placas ou *0* para o menu principal.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["pl3", "sanwa", "optica", "optico", "sensor"],
      "reply": "🎯 **Placa Óptica para Comando Sanwa**\n\nSubstitui os microswitches mecânicos por sensores infravermelhos. Elimina o 'clique' e o desgaste físico.\n\n📄 **Destaques:**\n- Resposta instantânea (<1ms)\n- Durabilidade ilimitada (sem contato físico)\n- Ajuste de sensibilidade via trimpot\n- Instalação via cabo flat 5 vias (necessita 5V)\n\n🔗 Detalhes e Variantes:\n- Placa Comando: https://www.fightarcade.com.br/placa-optica-comando\n- Botão Óptico: https://www.fightarcade.com.br/botaooptico\n- OptoJoy: https://www.fightarcade.com.br/optojoy\n\nDigite *6* para voltar ao menu de placas ou *0* para o menu principal.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["pl4", "324u", "arduino", "leonardo"],
      "reply": "🔧 **Placa 324U Zero Delay (Arduino Leonardo)**\n\nControladora baseada no chipset ATmega32U4. Ideal para projetos customizados com muitos botões.\n\n📄 **Especificações:**\n- Suporta até 20 botões + direcional\n- Protocolo USB HID Nativo\n- Compatível com PC, Raspberry Pi, PS3\n\n🔗 Detalhes: https://www.fightarcade.com.br/zero324\n\nVeja também:\n- Zero 8A: https://www.fightarcade.com.br/zero8a\n- Zero STM32: https://www.fightarcade.com.br/zerostm32\n\nDigite *6* para voltar ao menu de placas ou *0* para o menu principal.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["pl5", "wireless", "sem fio", "bluetooth"],
      "reply": "📡 **Placa Wireless Fight Arcade**\n\nSolução para montar controles arcade sem fio com bateria recarregável.\n\n📄 **Specs:**\n- Conexão: Bluetooth e Wireless 2.4GHz\n- Entrada para bateria Lítio/Li-po\n- Latência otimizada para jogos de luta\n\n🔗 Detalhes: https://www.fightarcade.com.br/wire\n\nDigite *6* para voltar ao menu de placas ou *0* para o menu principal.",
      "pause_bot_after_reply": false
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
      "reply": "Ok, para *comando que não funciona*:\n1. Verifique os fios na parte traseira, algum pode ter soltado.\n2. Com o fliperama ligado, veja se a placa principal tem um LED aceso.\n\n🔗 Peças de reposição: https://www.fightarcade.com.br/comando\n\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["s2"],
      "reply": "Certo, para *comando andando sozinho*: se for MECÂNICO, uma micro-switch pode estar desalinhada (https://www.fightarcade.com.br/comandosw). Se for ÓPTICO, pode ser interferência de luz. Nosso vídeo manual mostra como ajustar: www.fightarcade.com.br/videomanual\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
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
      "reply": "Sim, é possível *adicionar ou remover jogos*. Temos um tutorial completo: https://sl1nk.com/adicionarouremoverjogos. *Atenção:* Se feito de forma incorreta, pode danificar o sistema.\n\n🔗 Arquivos úteis: https://www.fightarcade.com.br/files\n\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["s7"],
      "reply": "Para *instalar e configurar um controle adicional*:\n\n1. O sistema é baseado em **Linux**, tornando-o **Plug and Play** com a maioria dos controles USB do mercado.\n2. **Dica:** Recomendamos controles **Sem Fio (Wireless)** que possuam **dongle USB**, para maior liberdade e facilidade de instalação.\n3. Basta conectar o dongle/cabo na porta USB externa e configurar dentro do menu do sistema (Start > Configurar Controle).\n\nGuia passo a passo: https://sl1nk.com/configurarcontrolesnovos\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["s8"],
      "reply": "Claro! Nossos guias principais são:\n\n📄 *Manual em Texto:* https://www.fightarcade.com.br/manual\n📹 *Manual em Vídeo:* www.fightarcade.com.br/videomanual\n🔧 *Manual Pico:* https://www.fightarcade.com.br/manual-pico\n\nVisite nosso site: https://www.fightarcade.com.br\n\nPara voltar ao menu de suporte, digite *3*. Para o menu principal, digite *0*.",
      "pause_bot_after_reply": false
    },
    {
      "keywords": ["placas", "componentes", "desempenho", "lag", "pico", "sanwa", "zero delay"],
      "reply": "Você está procurando por máxima performance! Nossos controles são configurados com as melhores peças:\n\n- *Placa Pico (RP2040):* O coração dos nossos controles. Latência de menos de 1 milissegundo (input lag), ideal para competição. Mais detalhes: https://www.fightarcade.com.br/pico1/\n- *Comando Óptico vs. Mecânico:* O comando mecânico usa peças físicas (micro-switches). O óptico usa sensores de luz, garantindo mais precisão e durabilidade.\n- *Componentes Premium:* Oferecemos peças de marcas como Sanwa (https://www.fightarcade.com.br/sanwa) e Seimitsu. Entre em contato com um atendente para um orçamento.\n\n🔗 Veja todas as placas: https://www.fightarcade.com.br/PLACAS\n\nPosso ajudar com algo mais?",
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
2.  **USO DE LINKS:** SEMPRE que mencionar um produto, tecnologia ou manual que conste no "Mapeamento de Links e Recursos", você DEVE incluir o link correspondente da Fight Arcade para que o usuário possa clicar.
3.  **CONHECIMENTO GERAL:** Se a pergunta for sobre o universo arcade em geral (peças como Sanwa, sistemas como Pandory, história dos jogos, etc.) e a resposta NÃO estiver na base de conhecimento da empresa, você TEM PERMISSÃO para usar seu conhecimento geral de especialista para dar uma resposta completa e informativa.
4.  **CONVERSA CASUAL:** Cumprimente os usuários de volta e mantenha uma conversa amigável.
5.  **FORA DO TÓPICO:** Se a pergunta não tiver relação nenhuma com arcades ou com a Fight Arcade, responda educadamente que você só pode ajudar com esses assuntos.

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