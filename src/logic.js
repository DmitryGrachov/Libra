// ===== Латинская морфология: III склонение =====
const VOW = "aeiouy";
function norm(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
    .replace(/[^a-z]/g, "");
}
// Разбиение на «гласные ядра» (слоги). Дифтонги ae, oe, au, eu — один слог.
function vowelGroups(w) {
  const groups = [];
  for (let i = 0; i < w.length; i++) {
    const c = w[i];
    if (!VOW.includes(c)) continue;
    // u после q и после ng/g перед гласной — согласный звук [v]
    if (c === "u" && i > 0 && (w[i - 1] === "q" || (w[i - 1] === "g" && w[i - 2] === "n")) && VOW.includes(w[i + 1] || "")) continue;
    const two = w.substr(i, 2);
    if (["ae", "oe", "au"].includes(two) || (two === "eu" && !/^eu[ms]?$/.test(w.slice(i)))) {
      groups.push([i, i + 1]); i++; continue;
    }
    groups.push([i, i]);
  }
  return groups;
}
const syllables = (w) => vowelGroups(w).length;
// Деление на слоги для показа: границы перед последней согласной в группе
function splitSyllables(w) {
  const g = vowelGroups(w);
  if (g.length < 2) return [w];
  const parts = []; let start = 0;
  for (let k = 0; k < g.length - 1; k++) {
    const endV = g[k][1], nextV = g[k + 1][0];
    let cons = w.slice(endV + 1, nextV);
    let cut;
    if (cons.length <= 1) cut = endV + 1;
    else {
      // muta cum liquida и диграфы ch/ph/th/rh/qu остаются вместе
      const tail2 = cons.slice(-2), tail3 = cons.slice(-3);
      if (/^[cpt]h[lr]$/.test(tail3)) cut = nextV - 3;
      else if (/^([bcgpf][lr]|[dt]r)$/.test(tail2) || /^[cptr]h$/.test(tail2) || tail2 === "qu" || tail2 === "gu") cut = nextV - 2;
      else cut = nextV - 1;
    }
    parts.push(w.slice(start, cut)); start = cut;
  }
  parts.push(w.slice(start));
  return parts;
}
// Восстановление полной формы Gen. Sing. по словарной записи «index, icis»
function fullGenitive(nom, end) {
  nom = norm(nom); end = norm(end);
  if (!end) return "";
  // уже полная форма: cor, cordis; os, ossis; pes, pedis
  if (end.length >= nom.length && end.slice(0, 2) === nom.slice(0, 2)) return end;
  if (end === "is") {
    // равносложные: pubes→pubis, canalis→canalis, rete→retis
    return nom.replace(/(is|es|ys|e|s)$/, "") + "is";
  }
  const g = vowelGroups(nom);
  const lastSylStart = g.length >= 2 ? g[g.length - 2][1] + 1 : 0;
  // ищем первую букву окончания внутри последнего слога: abductor|oris, laryn|x → lar+yngis, ven|ter → ven+tris
  for (let k = nom.length - 1; k >= lastSylStart; k--) {
    if (nom[k] === end[0]) return nom.slice(0, k) + end;
  }
  // иначе отрезаем от последней гласной: index → ind+icis, foramen → foram+inis
  const lv = g.length ? g[g.length - 1][0] : nom.length;
  return nom.slice(0, lv) + end;
}
const isCons = (c) => c && !VOW.includes(c);
// Конечные согласные практической основы (диграфы ch/ph/th/rh считаются за один, x = 2)
function finalConsonants(stem) {
  let i = stem.length - 1, n = 0, letters = "";
  while (i >= 0 && isCons(stem[i])) {
    if (stem[i] === "h" && i > 0 && "cptr".includes(stem[i - 1])) { letters = stem.slice(i - 1, i + 1) + letters; i -= 2; n++; continue; }
    n += stem[i] === "x" ? 2 : 1;
    letters = stem[i] + letters; i--;
  }
  return { n, letters };
}

// Исключения, которые учебники разбирают отдельно
const EXCEPTIONS = {
  // гласная по форме Nom (n, -ar), но склоняется по согласной
  hepar: { type: "consonant", note: "Исключение: hepar, atis n оканчивается на -ar, но склоняется по согласной разновидности (Gen. Pl. hepatum)." },
  // равносложные, но склоняются по согласной
  pater: { type: "consonant", note: "Исключение: равносложное, но относится к согласной разновидности (Gen. Pl. patrum)." },
  mater: { type: "consonant", note: "Исключение: равносложное, но относится к согласной разновидности (Gen. Pl. matrum)." },
  frater: { type: "consonant", note: "Исключение: равносложное, но относится к согласной разновидности (Gen. Pl. fratrum)." },
  canis: { type: "consonant", note: "Исключение: равносложное, но относится к согласной разновидности (Gen. Pl. canum)." },
  juvenis: { type: "consonant", note: "Исключение: равносложное, но относится к согласной разновидности (Gen. Pl. juvenum)." },
  senex: { type: "consonant", note: "Исключение: относится к согласной разновидности (Gen. Pl. senum)." },
  // Чернявский, § 101, примечание 4: греческие larynx, pharynx, meninx, phalanx — Gen. Pl. на -um
  larynx: { type: "consonant", note: "Исключение (Чернявский, § 101): греческое существительное, основа на -ng, но Gen. Pl. на -um — laryngum." },
  pharynx: { type: "consonant", note: "Исключение (Чернявский, § 101): греческое существительное, основа на -ng, но Gen. Pl. на -um — pharyngum." },
  meninx: { type: "consonant", note: "Исключение (Чернявский, § 101): греческое существительное, основа на -ng, но Gen. Pl. на -um — meningum." },
  phalanx: { type: "consonant", note: "Исключение (Чернявский, § 101): греческое существительное, основа на -ng, но Gen. Pl. на -um — phalangum." },
  salpinx: { type: "consonant", note: "Склоняется как larynx, pharynx (греческое на -nx): Gen. Pl. salpingum." },
  mesosalpinx: { type: "consonant", note: "Склоняется как salpinx (греческое на -nx): Gen. Pl. mesosalpingum." },
  sal: { type: "consonant", note: "Исключение: односложное sal, salis склоняется по согласной разновидности (Gen. Pl. salum)." },
};
const EXTRA_NOTES = {
  vas: "Особенность (Чернявский, § 101): во мн. ч. vas склоняется по II склонению — Nom. Pl. vasa, Gen. Pl. vasorum.",
  ile: "Gen. Pl. ilium используется в термине os ilium — подвздошная кость (Чернявский, § 101).",
  os: "Не путать: os, oris n — рот (согласная) и os, ossis n — кость (смешанная А).",
};
// Слова с Acc. -im и Abl. -i (особые формы, разновидность по алгоритму не меняется)
const ABL_I = new Set(["tussis", "febris", "pelvis", "sitis", "vis", "securis", "turris", "puppis", "ravis", "sinapis", "cannabis", "amussis", "buris"]);

const TYPES = {
  vowel: { name: "Гласная", short: "гласн.", genPl: "-ium", ablSg: "-i", nomPlN: "-ia" },
  mixedB: { name: "Смешанная Б", short: "смеш. Б", genPl: "-ium", ablSg: "-e", nomPlN: "-a" },
  mixedA: { name: "Смешанная А", short: "смеш. А", genPl: "-ium", ablSg: "-e", nomPlN: "-a" },
  consonant: { name: "Согласная", short: "согл.", genPl: "-um", ablSg: "-e", nomPlN: "-a" },
};

// Главный алгоритм (ровно три вопроса, как у преподавателя)
function classify(nomRaw, genEndRaw, genderRaw) {
  const nom = norm(nomRaw);
  const gender = (genderRaw || "").toLowerCase().replace(/[^mfn]/g, "");
  const gen = fullGenitive(nom, genEndRaw);
  const r = { nom, gen, gender, steps: [], type: null, notes: [] };
  if (!gen.endsWith("is")) {
    r.error = "Это не III склонение: в Gen. Sing. у III склонения окончание -is.";
    return r;
  }
  const stem = gen.slice(0, -2);
  r.stem = stem;
  r.sylNom = syllables(nom); r.sylGen = syllables(gen);
  r.splitNom = splitSyllables(nom); r.splitGen = splitSyllables(gen);
  const fc = finalConsonants(stem);
  r.final = fc;

  // Шаг 1 — гласная разновидность
  const vEnd = (nom.match(/(al|ar|e)$/) || [])[1];
  const isNeut = gender.includes("n");
  const q1 = isNeut && !!vEnd;
  r.steps.push({
    q: "Это существительное гласной разновидности?",
    rule: "Гласная разновидность — существительные среднего рода (n) с окончанием Nom. Sing. -e, -al, -ar.",
    yes: q1,
    why: q1
      ? `Средний род, Nom. Sing. оканчивается на -${vEnd}.`
      : (!isNeut ? `Род — ${gender ? genderName(gender) : "не указан"}, а не средний.` : `Средний род, но Nom. Sing. не оканчивается на -e, -al, -ar.`),
  });
  const ex = EXCEPTIONS[nom];
  if (q1) { r.type = "vowel"; }
  else {
    // Шаг 2 — равносложность
    const equal = r.sylNom === r.sylGen;
    const esIs = /(es|is)$/.test(nom);
    const q2 = equal && esIs;
    const sylTxt = `${r.splitNom.join("-")} — ${r.sylNom} ${plural(r.sylNom, "слог", "слога", "слогов")}, ${r.splitGen.join("-")} — ${r.sylGen} ${plural(r.sylGen, "слог", "слога", "слогов")}.`;
    r.steps.push({
      q: "Это существительное равносложное?",
      rule: "Равносложные имеют в Nom. Sing. и Gen. Sing. одинаковое число слогов и окончание Nom. Sing. -es или -is (pubes – pubis).",
      yes: q2,
      why: sylTxt + (q2 ? " Слогов поровну, Nom. Sing. на -" + nom.slice(-2) + "."
        : equal ? " Слогов поровну, но Nom. Sing. не оканчивается на -es/-is, поэтому равносложным в смысле правила не считается."
        : " В Gen. Sing. слогов больше — неравносложное."),
    });
    if (q2) r.type = "mixedB";
    else {
      // Шаг 3 — сколько согласных на конце практической основы
      const q3 = fc.n === 1;
      r.steps.push({
        q: "Практическая основа заканчивается на 1 согласный?",
        rule: "Практическая основа — форма Gen. Sing. без окончания -is.",
        yes: q3,
        why: fc.n === 0
          ? `Основа ${stem}- оканчивается на гласный.`
          : `Основа ${stem}- оканчивается на ${fc.n === 1 ? "один согласный" : fc.n + " согласных"}: «${fc.letters}»${fc.letters === "x" ? " (x = c + s)" : ""}.`,
      });
      r.type = q3 || fc.n === 0 ? "consonant" : "mixedA";
    }
  }
  r.algoType = r.type;
  if (ex) { r.type = ex.type; r.notes.push(ex.note); r.exception = true; }
  if (EXTRA_NOTES[nom]) r.notes.push(EXTRA_NOTES[nom]);
  if (ABL_I.has(nom)) r.notes.push("Особые формы: Acc. Sing. -im, Abl. Sing. -i (как у гласной разновидности).");
  if (/sis$/.test(nom) && r.type === "mixedB") r.notes.push("Греческие существительные на -sis имеют Abl. Sing. на -i (dosis – dosi).");
  return r;
}
function genderName(g) {
  return { m: "мужской (m)", f: "женский (f)", n: "средний (n)", mf: "мужской/женский (m, f)" }[g] || g;
}
function plural(n, a, b, c) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return a;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b;
  return c;
}
if (typeof module !== "undefined") module.exports = { classify, fullGenitive, syllables, splitSyllables, norm, TYPES };
