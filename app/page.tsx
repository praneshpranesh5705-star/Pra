"use client";

import {ChangeEvent, DragEvent, useMemo, useState} from "react";

type Mode = "solve"|"explain"|"code"|"innovate"|"study";
type HistoryItem = {id:number,title:string,mode:Mode,time:string};

const modes:{id:Mode;icon:string;label:string;desc:string}[]=[
  {id:"solve",icon:"∑",label:"Problem Solver",desc:"Maths, science and engineering"},
  {id:"explain",icon:"◈",label:"Deep Explain",desc:"Understand books and concepts"},
  {id:"code",icon:"</>",label:"Code Doctor",desc:"Debug, improve and generate code"},
  {id:"innovate",icon:"✦",label:"Innovation Lab",desc:"Turn knowledge into prototypes"},
  {id:"study",icon:"⌁",label:"Study Copilot",desc:"Notes, questions and revision"}
];

export default function Home(){
  const [file,setFile]=useState<File|null>(null);
  const [mode,setMode]=useState<Mode>("solve");
  const [prompt,setPrompt]=useState("");
  const [answer,setAnswer]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [drag,setDrag]=useState(false);
  const [history,setHistory]=useState<HistoryItem[]>([]);
  const [showHistory,setShowHistory]=useState(false);

  const fileInfo=useMemo(()=>file?{name:file.name,size:(file.size/1024/1024).toFixed(2)+" MB",type:file.type||"unknown"}:null,[file]);

  function pick(f:File|null){if(!f)return;setFile(f);setAnswer("");setError("");}
  function onInput(e:ChangeEvent<HTMLInputElement>){pick(e.target.files?.[0]||null)}
  function onDrop(e:DragEvent<HTMLDivElement>){e.preventDefault();setDrag(false);pick(e.dataTransfer.files?.[0]||null)}

  async function runAI(){
    if(!prompt.trim() && !file){setError("Add a question, upload a file, or do both.");return}
    setLoading(true);setError("");setAnswer("");
    const form=new FormData();
    form.append("prompt",prompt.trim() || modeInstruction(mode));
    if(file)form.append("file",file);
    try{
      const res=await fetch("/api/solve",{method:"POST",body:form});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"AI request failed");
      setAnswer(data.answer);
      setHistory(h=>[{id:Date.now(),title:prompt.trim()||file?.name||"AI task",mode,time:new Date().toLocaleTimeString()},...h].slice(0,8));
    }catch(e){setError(e instanceof Error?e.message:"Something went wrong.")}
    finally{setLoading(false)}
  }

  function modeInstruction(m:Mode){
    return ({
      solve:"Analyze the uploaded material and solve the problem completely. Show every important step and verify the final answer.",
      explain:"Deeply explain the uploaded material in simple language, then give key concepts, examples, formulas and common mistakes.",
      code:"Review the uploaded code, find bugs and security/reliability issues, explain them and provide corrected production-ready code.",
      innovate:"Study the uploaded material and design 3 strong real-world innovations. Pick the best one and give architecture, components, software, workflow, cost and prototype plan.",
      study:"Create a high-quality study pack from the uploaded material: summary, important definitions, formulas, likely questions, answers and a revision plan."
    } as Record<Mode,string>)[m];
  }

  function quick(q:string){setPrompt(q);setTimeout(runAI,0)}
  function clearAll(){setFile(null);setPrompt("");setAnswer("");setError("")}

  return <main>
    <nav className="nav shell">
      <div className="logo"><span>◉</span> NOVA<span className="accent">FORGE</span> <small>AI</small></div>
      <div className="navActions"><button onClick={()=>setShowHistory(!showHistory)}>History</button><a href="#workspace">Workspace</a><span className="live">● AI ENGINE</span></div>
    </nav>

    <section className="hero shell">
      <div className="eyebrow">ADVANCED KNOWLEDGE → REASONING → SOLUTION → INNOVATION</div>
      <h1>Build. Solve. <span>Invent.</span></h1>
      <p>Upload a book, PDF, image, source code or problem. NovaForge AI understands the material, reasons through it and gives you an actionable solution.</p>
      <div className="heroStats"><div><b>01</b><span>Upload anything</span></div><div><b>02</b><span>Ask naturally</span></div><div><b>03</b><span>Get a worked solution</span></div><div><b>04</b><span>Build the next idea</span></div></div>
    </section>

    <section id="workspace" className="shell workspace">
      <aside className="sidebar">
        <div className="sideTitle">AI MODES</div>
        {modes.map(m=><button key={m.id} className={mode===m.id?"mode active":"mode"} onClick={()=>setMode(m.id)}><span className="modeIcon">{m.icon}</span><span><b>{m.label}</b><small>{m.desc}</small></span></button>)}
        <div className="sideCard"><b>⚡ Real AI reasoning</b><p>The upload is sent securely to the configured AI backend for semantic analysis.</p></div>
      </aside>

      <section className="mainPanel">
        <div className="panelHeader"><div><span className="kicker">NOVA WORKSPACE</span><h2>{modes.find(x=>x.id===mode)?.label}</h2></div><span className="secure">ENCRYPTED REQUEST</span></div>

        <div className={"dropzone "+(drag?"drag":"")} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={onDrop}>
          <input id="file" type="file" onChange={onInput} accept=".pdf,.txt,.md,.doc,.docx,.png,.jpg,.jpeg,.webp,.js,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.cs,.go,.rs,.json,.html,.css,.ino"/>
          <label htmlFor="file"><div className="uploadIcon">↑</div><b>Drop a file into the reasoning engine</b><span>PDF • DOC • Images • Code • Notes • Books</span><em>or click to browse</em></label>
        </div>

        {fileInfo&&<div className="fileBar"><span className="fileBadge">FILE</span><div><b>{fileInfo.name}</b><small>{fileInfo.type} • {fileInfo.size}</small></div><button onClick={()=>setFile(null)}>×</button></div>}

        <div className="promptBox">
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder={file?"Tell NovaForge exactly what you want to solve from this file…":"Type a problem, paste a question, or upload material above…"} />
          <div className="promptBottom"><span>Shift+Enter for a new line • Be specific for deeper results</span><button className="solveBtn" onClick={runAI} disabled={loading}>{loading?"THINKING…":"RUN AI →"}</button></div>
        </div>

        <div className="quick">
          <span>TRY:</span>
          <button onClick={()=>quick("Solve this step-by-step and verify the final answer.")}>Solve step-by-step</button>
          <button onClick={()=>quick("Find the key concepts and explain them simply with examples.")}>Explain concepts</button>
          <button onClick={()=>quick("Find problems and improvements, then propose a better solution.")}>Find improvements</button>
          <button onClick={()=>quick("Create a high-impact innovation based on this material.")}>Invent</button>
        </div>

        {error&&<div className="error">⚠ {error}</div>}

        <div className="answer">
          <div className="answerHead"><span>AI RESPONSE</span>{answer&&<button onClick={()=>navigator.clipboard.writeText(answer)}>Copy</button>}</div>
          {loading?<div className="thinking"><i></i><i></i><i></i><b>NovaForge is reasoning through your material…</b></div>:answer?<pre>{answer}</pre>:<div className="empty"><div>◇</div><b>Your solution appears here</b><span>Upload + ask → analyze → reason → answer → next action</span></div>}
        </div>
      </section>
    </section>

    <section className="shell capability">
      <div><span>ENGINE</span><h2>One workspace. Multiple intelligence layers.</h2></div>
      <div className="capGrid">{["Document & book reasoning","Image understanding","Mathematics & science","Code debugging","Prototype architecture","Innovation generation","Study material creation","Engineering analysis"].map((x,i)=><div key={x}><b>0{i+1}</b><span>{x}</span></div>)}</div>
    </section>

    {showHistory&&<div className="historyModal"><div className="historyBox"><button className="close" onClick={()=>setShowHistory(false)}>×</button><span className="kicker">SESSION MEMORY</span><h2>Recent tasks</h2>{history.length?history.map(x=><div className="historyRow" key={x.id}><b>{x.title}</b><span>{x.mode} • {x.time}</span></div>):<p>No tasks in this session yet.</p>}</div></div>}

    <footer className="shell footer">NOVA<span>FORGE</span> AI <small>• Advanced Problem Solving & Innovation Platform</small><button onClick={clearAll}>Reset workspace</button></footer>
  </main>
}