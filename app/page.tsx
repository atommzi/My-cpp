"use client";

import { useMemo, useState } from "react";

type Chapter = {
  id: number;
  label: string;
  title: string;
  subtitle: string;
  accent: string;
  concepts: { title: string; code: string; text: string }[];
  trap: string;
  physics: { title: string; description: string; code: string };
  exercise: string;
};

const chapters: Chapter[] = [
  {
    id: 1,
    label: "01 / START",
    title: "从源代码到可执行文件",
    subtitle: "终端、预处理、编译、链接与输入输出",
    accent: "#ff795c",
    concepts: [
      { title: "Linux 命令", code: "pwd · cd · ls · cp · mv · file · which", text: "先确认自己在哪里、文件是什么、程序从哪里来。# 是 shell 注释；${...} 是变量展开。" },
      { title: "四个阶段", code: ".cpp → 预处理 → 编译 → .o → 链接 → executable", text: "编译错误是某个源文件没看懂；链接错误通常是声明存在、定义却没被链接进来；运行时错误发生在程序启动后。" },
      { title: "程序入口", code: "int main(int argc, char** argv)", text: "main 是操作系统进入程序的入口。argc 是参数个数，argv 是每个命令行参数的字符指针。" },
      { title: "命名空间与 I/O", code: "std::cout << value << '\\n';", text: "iostream 提供流对象。学习阶段推荐写 std::，它能让名字来自哪里一目了然；endl 还会刷新缓冲区，不必每行都用。" },
    ],
    trap: "宏是预处理阶段的文本替换，不是变量或函数。常量优先 constexpr，简单函数优先普通函数或 inline 函数。",
    physics: {
      title: "给分析程序传入 ROOT 文件",
      description: "先不调用 ROOT，也能理解真实分析程序如何接收文件名。",
      code: `#include <iostream>\n#include <string>\n\nint main(int argc, char** argv) {\n    if (argc != 2) {\n        std::cerr << "Usage: ./count input.root\\n";\n        return 1;\n    }\n\n    const std::string filename = argv[1];\n    std::cout << "Will analyse: " << filename << '\\n';\n    return 0;\n}`,
    },
    exercise: "把程序拆成 main.cpp、analysis.cpp、analysis.hpp，分别编译成 .o 后链接。故意漏掉 analysis.o，观察链接器说了什么。",
  },
  {
    id: 2,
    label: "02 / DATA",
    title: "让数据类型匹配物理量",
    subtitle: "整数、浮点、const、auto、运算与数值边界",
    accent: "#f1b84b",
    concepts: [
      { title: "初始化", code: "double energy_keV{0.0};", text: "声明局部变量时立即初始化。花括号初始化还能阻止一部分窄化转换。未初始化值不是“默认等于零”。" },
      { title: "整数范围", code: "std::int64_t n_events{0};", text: "signed/unsigned 混算容易产生意外结果。事件计数很大时先估算范围；需要明确位宽时使用 <cstdint> 类型。" },
      { title: "浮点数", code: "float position_mm; double likelihood;", text: "float 常用于大量、容许约 7 位有效数字的数据；double 适合累计、拟合和需要约 15 位有效数字的计算。NaN 不等于它自己，inf 会继续传播。" },
      { title: "常量与推导", code: "constexpr double pi = 3.141592653589793;", text: "const 表示之后不改，constexpr 表示可在编译期求值。auto 让编译器推导类型，但关键物理单位仍应通过变量名表达。" },
    ],
    trap: "整数除法先截断再赋给 double：double efficiency = passed / total; 仍可能得到 0。至少一个操作数应转成 double。",
    physics: {
      title: "计算选择效率与泊松误差",
      description: "类型不仅决定占多少内存，也决定公式是否按预期计算。",
      code: `#include <cmath>\n#include <cstdint>\n#include <iomanip>\n#include <iostream>\n\nint main() {\n    const std::int64_t total{244825};\n    const std::int64_t passed{25281};\n\n    const double efficiency =\n        static_cast<double>(passed) / total;\n    const double sigma = std::sqrt(passed) / total;\n\n    std::cout << std::fixed << std::setprecision(4)\n              << efficiency << " ± " << sigma << '\\n';\n}`,
    },
    exercise: "把 passed 设成 0、把 total 设成 0、再把计数改为 unsigned。分别预测并验证结果，学会检查分母与 signed/unsigned 混算。",
  },
  {
    id: 3,
    label: "03 / FLOW",
    title: "把 selection 写成清晰的控制流",
    subtitle: "if、逻辑表达式、循环、break、switch",
    accent: "#66c49a",
    concepts: [
      { title: "条件", code: "if (energy > 1.0 && energy < 30.0) { ... }", text: "条件写进圆括号，执行块总是写花括号。&& 和 || 会短路，因此先放便宜、能保护后续计算的判断。" },
      { title: "循环", code: "for (std::size_t i = 0; i < n; ++i)", text: "for 适合明确的遍历，while 适合由条件驱动的过程，do-while 至少执行一次。注意循环变量、终止条件和更新语句。" },
      { title: "改变流程", code: "continue · break · return", text: "continue 跳过本轮，break 退出当前循环或 switch，return 退出整个函数。优先用它们表达早退出，goto 在现代 C++ 分析代码中极少需要。" },
      { title: "多分支", code: "switch (detector_region) { case 0: ... }", text: "switch 适合离散的整数或枚举状态。忘记 break 会继续落入下一个 case；需要贯穿时应明确标注。" },
    ],
    trap: "if (accepted = true) 是赋值，表达式的值为 true；判断相等要写 ==。浮点数通常不要直接用 == 比较测量结果。",
    physics: {
      title: "暗物质分析的 cut flow",
      description: "每一道 cut 都有明确含义，并保存各阶段事件数。",
      code: `#include <array>\n#include <vector>\n\nstruct Event { double s1, s2, r, z; };\n\nstd::array<int, 4> cutflow{};\nfor (const Event& e : events) {\n    ++cutflow[0];\n    if (e.s1 <= 3.0) continue;\n    ++cutflow[1];\n    if (e.s2 <= 100.0) continue;\n    ++cutflow[2];\n    if (e.r >= 500.0 || e.z <= -600.0) continue;\n    ++cutflow[3];\n}`,
    },
    exercise: "为 cut flow 增加能量窗，并计算每一步相对上一 cut 的效率。思考 cut 顺序会不会改变最终结果，以及会不会改变运行速度。",
  },
  {
    id: 4,
    label: "04 / SHAPE",
    title: "组织一批事件与一个事件",
    subtitle: "array、字符串、struct、union、enum 与 typedef",
    accent: "#67a9ff",
    concepts: [
      { title: "数组", code: "double bins[100]{};", text: "内置数组大小固定、连续存储且不检查越界。元素下标是 0 到 N−1。现代 C++ 的 std::array 和 std::vector 通常更易管理。" },
      { title: "字符串", code: "std::string run_name = \"run0\";", text: "C 风格字符串必须以 '\\0' 结尾；std::string 会管理长度和内存，拼接、复制、比较更安全。字符串字面量具有静态存储期。" },
      { title: "结构体", code: "struct Event { double x, y, z, energy; };", text: "struct 把属于同一个概念的不同类型数据放在一起。对事件、命中、材料属性而言，它比四个互相平行的数组更能表达语义。" },
      { title: "枚举与联合", code: "enum class Region { FV, Skin, Veto };", text: "enum class 为有限状态命名且避免隐式转成整数。union 的成员共享同一块内存，只有一个成员在某一时刻有效；普通分析数据很少需要手动使用。" },
    ],
    trap: "char name[4] 只能容纳最多 3 个可见 ASCII 字符再加 '\\0'。数组传进函数时常退化为指针，长度信息随之丢失。",
    physics: {
      title: "描述一个探测器事件",
      description: "让字段名同时携带物理含义和单位，枚举代替魔法数字。",
      code: `#include <string>\n\nenum class Region { Fiducial, Skin, Veto };\n\nstruct Event {\n    std::int64_t event_id{};\n    double energy_keV{};\n    double x_mm{}, y_mm{}, z_mm{};\n    Region region{Region::Fiducial};\n    std::string run_name;\n};\n\nEvent candidate{42, 2.3, 10.0, -8.0, -210.0,\n                Region::Fiducial, "run0"};`,
    },
    exercise: "建立 Hit 结构体和 100 个元素的数组，统计总沉积能。再改成 std::array<Hit, 100>，比较获取长度的方式。",
  },
  {
    id: 5,
    label: "05 / MEMORY",
    title: "真正理解指针与 new",
    subtitle: "地址、解引用、数组退化、动态内存与所有权",
    accent: "#c38df3",
    concepts: [
      { title: "指针是什么", code: "Event* p = &event;", text: "p 是一个变量，它保存 event 的地址；*p 表示该地址上的 Event 对象；p->energy 等价于 (*p).energy。指针类型告诉编译器如何解释那块内存。" },
      { title: "指针算术", code: "p + 1", text: "不是地址加 1 字节，而是移动 sizeof(*p) 字节到下一个同类型元素。裸指针本身不知道数组长度，所以越界尤其危险。" },
      { title: "动态内存", code: "auto* chain = new TChain(\"mcTree\");", text: "new 在动态存储区创建对象、调用构造函数，并返回对象地址。它解决的是对象生存期或大小需在运行时决定的问题，不等于“创建指针”。" },
      { title: "所有权", code: "auto chain = std::make_unique<TChain>(\"mcTree\");", text: "裸 new 必须与 delete 配对，否则泄漏；重复 delete 或使用已 delete 的地址同样危险。现代 C++ 优先栈对象、vector 和智能指针。" },
    ],
    trap: "nullptr 表示不指向任何对象，但解引用 nullptr 会造成未定义行为。delete[] 对应 new[]，delete 对应单个 new，不能混用。",
    physics: {
      title: "ROOT 中的 TChain 到底为何用 new",
      description: "若对象只在当前作用域使用，栈对象往往更直接；只有确实需要动态生存期时才使用智能指针。",
      code: `#include "TChain.h"\n#include <iostream>\n\nint main() {\n    TChain chain{"mcTree"}; // 构造对象，不需要 new\n    chain.Add("input.root");\n    std::cout << chain.GetEntries() << '\\n';\n} // 离开作用域时自动析构\n\n// 需要动态所有权时：\n// auto chain = std::make_unique<TChain>("mcTree");\n// chain->Add("input.root");`,
    },
    exercise: "分别用栈对象、new/delete、std::unique_ptr 创建一个含 1000 个 double 的缓冲区。画出谁拥有内存、何时释放，并用 AddressSanitizer 检查故意制造的越界。",
  },
];

const roadmap = [
  ["NEXT", "函数与引用", "把 selection 拆成可测试的小函数；理解值传递、const 引用与返回值。"],
  ["CORE", "类与 RAII", "掌握构造/析构、复制/移动、智能指针；这是读懂 ROOT 和 Geant4 对象生命周期的关键。"],
  ["TOOLS", "STL 与算法", "vector、map、algorithm、迭代器、lambda；让事件循环更安全也更简洁。"],
  ["ROOT", "数据分析", "TFile/TTree/RDataFrame、TH1、TGraph、拟合与绘图；区分对象所有权与目录管理。"],
  ["G4", "Geant4", "几何、材料、粒子、process、run/event/step action；理解继承与虚函数后再系统进入。"],
  ["ADV", "性能与工程", "CMake、调试器、sanitizer、profiling、并行与可复现分析。"],
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="code-shell">
      <div className="code-head"><span>example.cpp</span><button onClick={copy} aria-label="复制代码">{copied ? "已复制" : "复制"}</button></div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState(5);
  const [query, setQuery] = useState("");
  const chapter = chapters.find((item) => item.id === active) ?? chapters[0];
  const hits = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return chapters.flatMap((item) => item.concepts
      .filter((concept) => `${concept.title} ${concept.code} ${concept.text}`.toLowerCase().includes(needle))
      .map((concept) => ({ chapter: item.id, title: concept.title, code: concept.code })));
  }, [query]);

  const jump = (id: number) => {
    setActive(id);
    setQuery("");
    requestAnimationFrame(() => document.getElementById("chapter")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="回到首页"><span className="brand-mark">C++</span><span>Particle Lab</span></a>
        <nav><a href="#chapters">知识地图</a><a href="#chapter">当前章节</a><a href="#roadmap">进阶路线</a></nav>
        <a className="repo-link" href="https://github.com/atommzi/My-cpp" target="_blank" rel="noreferrer">GitHub ↗</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>LEARNING LOG / 2026</span><span className="pulse">LIVE</span></p>
          <h1>不是背语法，<br />是学会<span>操纵数据。</span></h1>
          <p className="hero-intro">一份面向暗物质探测实验的 C++ 学习地图。把课程前五章连接到事件选择、ROOT 数据链和 Geant4 对象模型。</p>
          <div className="hero-actions"><button onClick={() => jump(1)}>从第一章开始</button><a href="#chapter">继续：指针与内存 →</a></div>
        </div>
        <div className="detector-card" aria-label="学习进度：完成五章">
          <div className="detector-grid" />
          <div className="orbit orbit-a" /><div className="orbit orbit-b" />
          <div className="detector-core"><strong>5</strong><span>/ 15 CHAPTERS</span></div>
          <span className="signal signal-a" /><span className="signal signal-b" /><span className="signal signal-c" />
          <div className="detector-label"><span>CURRENT STATE</span><strong>中等难度 · 基础成形</strong></div>
        </div>
      </section>

      <section className="metrics">
        <div><strong>05</strong><span>已完成章节</span></div><div><strong>20+</strong><span>核心概念</span></div><div><strong>05</strong><span>物理场景代码</span></div><div><strong>∞</strong><span>后续实验问题</span></div>
      </section>

      <section className="map-section" id="chapters">
        <div className="section-heading"><div><p>KNOWLEDGE MAP</p><h2>前五章，不是五座孤岛</h2></div><p>代码先被编译，再操纵特定类型的数据；控制流筛选数据，结构体组织数据，指针决定如何访问数据。</p></div>
        <div className="chapter-grid">
          {chapters.map((item) => <button key={item.id} onClick={() => jump(item.id)} className={`chapter-card ${active === item.id ? "active" : ""}`} style={{ "--accent": item.accent } as React.CSSProperties}>
            <span>{item.label}</span><strong>{item.title}</strong><p>{item.subtitle}</p><i>打开笔记 ↗</i>
          </button>)}
        </div>
        <div className="search-box">
          <span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="查找概念：例如 const、数组、指针……" aria-label="搜索知识点" />
          {query && <div className="search-results">{hits.length ? hits.map((hit, index) => <button key={`${hit.chapter}-${index}`} onClick={() => jump(hit.chapter)}><b>CH.{hit.chapter}</b><span>{hit.title}</span><code>{hit.code}</code></button>) : <p>暂未找到；它可能在后续章节。</p>}</div>}
        </div>
      </section>

      <section className="chapter-section" id="chapter" style={{ "--accent": chapter.accent } as React.CSSProperties}>
        <aside>
          <p>CHAPTER INDEX</p>
          {chapters.map((item) => <button key={item.id} onClick={() => setActive(item.id)} className={active === item.id ? "active" : ""}><span>0{item.id}</span>{item.title}</button>)}
          <div className="rule"><span>学习规则 01</span><p>每个概念先回答“内存里发生了什么”，再写代码。</p></div>
        </aside>
        <article className="chapter-content">
          <div className="chapter-title"><p>{chapter.label}</p><h2>{chapter.title}</h2><span>{chapter.subtitle}</span></div>
          <div className="concept-list">{chapter.concepts.map((concept, index) => <div className="concept" key={concept.title}><b>0{index + 1}</b><div><h3>{concept.title}</h3><code>{concept.code}</code><p>{concept.text}</p></div></div>)}</div>
          <div className="trap"><strong>⚠ 易错点</strong><p>{chapter.trap}</p></div>
          <div className="physics-example"><div className="example-title"><p>FROM SYNTAX TO PHYSICS</p><h3>{chapter.physics.title}</h3><span>{chapter.physics.description}</span></div><CodeBlock code={chapter.physics.code} /></div>
          <div className="exercise"><span>LAB / 练习</span><p>{chapter.exercise}</p></div>
        </article>
      </section>

      <section className="mental-model">
        <div><p>ONE MENTAL MODEL</p><h2>读懂这四行，<br />就读懂了裸指针的核心。</h2></div>
        <div className="memory-viz">
          <div className="memory-code"><code>int num = 10;</code><code>int* p = &num;</code><code>*p = 20;</code><code>std::cout &lt;&lt; num;</code></div>
          <div className="arrow">ADDRESS<br />────────────→</div>
          <div className="memory-box"><small>0x7FFD…A8</small><strong>20</strong><span>num · int</span></div>
          <p><b>p 保存地址。</b> &amp;num 取得地址。*p 沿地址找到对象。改变 *p，就是改变 num。</p>
        </div>
      </section>

      <section className="roadmap-section" id="roadmap">
        <div className="section-heading"><div><p>NEXT TRAJECTORY</p><h2>从 C++ 基础到实验软件</h2></div><p>不要急着“学完 C++ 再学 ROOT”。从函数开始就并行写小型物理分析；学到类、继承和 RAII 后，再系统进入 Geant4。</p></div>
        <div className="roadmap">{roadmap.map((item, index) => <div key={item[1]}><span>{String(index + 1).padStart(2, "0")}</span><b>{item[0]}</b><h3>{item[1]}</h3><p>{item[2]}</p></div>)}</div>
      </section>

      <footer><div className="brand"><span className="brand-mark">C++</span><span>Particle Lab</span></div><p>根据 ShiqiYu / CPP 前五章与个人关键词笔记整理。</p><a href="https://github.com/ShiqiYu/CPP" target="_blank" rel="noreferrer">课程源仓库 ↗</a></footer>
    </main>
  );
}
