# C++ × Particle Physics Lab

面向暗物质探测实验的交互式 C++ 学习网站。内容根据 [ShiqiYu/CPP](https://github.com/ShiqiYu/CPP) 前五章和个人关键词笔记整理，并将基础语法连接到 ROOT、Geant4 与粒子物理数据分析场景。

## 当前内容

- Chapter 1：终端、预处理、编译、链接、命名空间与 I/O
- Chapter 2：整数、浮点、初始化、`const`、`constexpr`、`auto` 与数值边界
- Chapter 3：条件判断、逻辑表达式、循环、`break`、`continue` 与 `switch`
- Chapter 4：数组、字符串、`struct`、`union`、`enum class`
- Chapter 5：指针、地址、解引用、动态内存、`new/delete` 与所有权
- 粒子物理示例：命令行 ROOT 文件输入、选择效率、cut flow、事件结构体、`TChain` 生命周期
- 后续路线：函数与引用 → 类与 RAII → STL → ROOT → Geant4 → 性能与工程

## 本地运行

需要 Node.js 22.13 或更新版本。

```bash
npm ci
npm run dev
```

生产构建：

```bash
npm run build
```

## 内容原则

每个主题都按“概念 → 内存模型 → 易错点 → 物理示例 → 练习”组织。代码优先使用现代 C++：立即初始化、`constexpr`、范围 `for`、`enum class`、栈对象和智能指针；同时解释 ROOT/Geant4 旧式接口中仍常见的裸指针。
