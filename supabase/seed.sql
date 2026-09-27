-- Seed curriculum into Supabase. Mirrors data/curriculum.ts + data/seed-*.ts.
-- Idempotent: safe to re-run. Keep in sync with the code seed (code stays the
-- source of truth; this file loads it into Postgres).

insert into public.skills (id, component, label_en, label_zh) values
  ('grammar.subjunctive', 'grammar',   'Subjunctive triggers',     '虛擬式觸發詞'),
  ('grammar.ser-estar',   'grammar',   'Ser vs Estar',             'Ser 同 Estar'),
  ('grammar.past-tenses', 'grammar',   'Indefinido vs Imperfecto', '過去式對比'),
  ('grammar.connectors',  'grammar',   'Discourse connectors',     '連接詞 / 論述銜接'),
  ('reading.scan',        'reading',   'Scan & locate',            '掃描定位'),
  ('reading.inference',   'reading',   'Inference',                '推斷題'),
  ('listening.gist',      'listening', 'Gist & detail',            '大意同細節'),
  ('writing.formal-email','writing',   'Formal email',             '正式電郵'),
  ('writing.argument',    'writing',   'Structured argument',      '議論結構')
on conflict (id) do update set
  component = excluded.component,
  label_en = excluded.label_en,
  label_zh = excluded.label_zh;

insert into public.items (id, skill_id, type, ladder_stage, difficulty, tags, prompt) values
  ('mc-subj-1', 'grammar.subjunctive', 'mc', 1, 2, array['subjunctive','para-que'],
    $json${"stemEs":"Te lo explico otra vez para que lo ___ mejor.","options":["entiendes","entiendas","entenderás"],"correctIndex":1,"whyZh":"「para que」係目的連接詞，後面一定要用虛擬式，所以要 entiendas，唔係 entiendes。"}$json$::jsonb),

  ('mc-serestar-1', 'grammar.ser-estar', 'mc', 1, 1, array['ser-estar'],
    $json${"stemEs":"La reunión ___ en la sala 3, empieza a las nueve.","options":["es","está","hay"],"correctIndex":0,"whyZh":"講「事件喺邊度舉行」要用 ser（La reunión es en…）；estar 係講物件位置。"}$json$::jsonb),

  ('mc-past-1', 'grammar.past-tenses', 'mc', 1, 2, array['indefinido','imperfecto'],
    $json${"stemEs":"Cuando ___ pequeño, íbamos a la playa cada verano.","options":["fui","era","he sido"],"correctIndex":1,"whyZh":"描述過去嘅背景／習慣用未完成過去式 imperfecto（era），indefinido（fui）係講一次過完成嘅事。"}$json$::jsonb),

  ('mc-conn-1', 'grammar.connectors', 'mc', 1, 2, array['connectors','contrast'],
    $json${"stemEs":"El plan es bueno; ___, necesitamos más tiempo para aplicarlo.","options":["por lo tanto","sin embargo","además"],"correctIndex":1,"whyZh":"前後係轉折關係，要用 sin embargo（然而）；por lo tanto 係因果，además 係補充。"}$json$::jsonb),

  ('read-1', 'reading.scan', 'reading', 4, 2, array['scan','inference'],
    $json${"titleEs":"Trabajar desde casa","passageEs":"Desde la pandemia, muchas empresas españolas han mantenido el teletrabajo, al menos algunos días a la semana. Según un estudio reciente, los empleados valoran sobre todo la flexibilidad horaria y el ahorro de tiempo en desplazamientos. Sin embargo, no todo son ventajas: algunos trabajadores afirman que les cuesta desconectar del trabajo y que echan de menos el contacto diario con sus compañeros.","glosses":[{"phrase":"teletrabajo","zh":"遙距／在家工作"},{"phrase":"desplazamientos","zh":"通勤、來回路程"},{"phrase":"desconectar","zh":"抽離、停止諗返工嘅嘢"},{"phrase":"echan de menos","zh":"掛住、懷念"}],"questions":[{"q":"¿Qué valoran más los empleados del teletrabajo?","options":["El sueldo más alto","La flexibilidad y el ahorro de tiempo","Menos reuniones"],"correctIndex":1},{"q":"Según el texto, ¿cuál es una desventaja?","options":["Cuesta desconectar del trabajo","Se gana menos dinero","Hay que viajar más"],"correctIndex":0}],"strategyZh":"策略：先睇問題同選項嘅關鍵詞，再返去段落掃描（scan）搵對應嘅句子，唔使逐個字讀。","timeLimitSec":180}$json$::jsonb),

  ('write-1', 'writing.formal-email', 'writing', 3, 2, array['formal-email','register','connectors'],
    $json${"taskEn":"Formal email — complaint & request","taskZh":"正式電郵：投訴 + 提出要求","scenarioEs":"Compraste un curso de español en línea, pero llevas dos semanas sin poder acceder a las clases. Escribe un correo formal a la academia: explica el problema, expresa tu malestar y pide una solución.","minWords":120,"maxWords":150,"requiredElements":[{"key":"estimad","labelZh":"正式稱呼（Estimados/Estimada…）"},{"key":"atentamente","labelZh":"正式結尾（Atentamente / Un saludo）"}]}$json$::jsonb)
on conflict (id) do update set
  skill_id = excluded.skill_id,
  type = excluded.type,
  ladder_stage = excluded.ladder_stage,
  difficulty = excluded.difficulty,
  tags = excluded.tags,
  prompt = excluded.prompt;
