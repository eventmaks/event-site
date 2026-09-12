(()=>{
  const body=document.body;

  /* ========================================================
     REFRESH POSITION FIX V47
     Always reopen/reload on the first Hero screen.
     Safari/Yandex may restore scroll after parsing, so repeat briefly.
     ======================================================== */
  try{
    if("scrollRestoration" in history) history.scrollRestoration="manual";
  }catch(error){}

  let initialTopLock=true;
  const forceInitialTop=()=>{
    if(!initialTopLock) return;
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    window.scrollTo(0,0);
  };

  forceInitialTop();
  requestAnimationFrame(forceInitialTop);
  window.addEventListener("pageshow",forceInitialTop,{passive:true});
  window.addEventListener("load",()=>{
    forceInitialTop();
    window.setTimeout(forceInitialTop,60);
    window.setTimeout(forceInitialTop,180);
    window.setTimeout(()=>{
      forceInitialTop();
      initialTopLock=false;
    },420);
  },{once:true});
  const noise=document.querySelector(".noise");
  const typed=document.getElementById("typed");
  const phoneQuery=window.matchMedia("(max-width: 767px)");
  let phoneLite=phoneQuery.matches;
  body.classList.toggle("phone-lite",phoneLite);

  /* ========================================================
     MOBILE iOS APP-SWITCHER OPENING V43
     Uses the real current Hero DOM as the preview source.
     No regenerated webpage / no replacement recording.
     ======================================================== */
  let iosLaunchDone=!phoneLite;
  let iosLaunchTimer=0;

  function stripCloneIds(root){
    if(!root) return;
    if(root.id) root.removeAttribute("id");
    root.querySelectorAll("[id]").forEach(el=>el.removeAttribute("id"));
    root.querySelectorAll("[aria-labelledby],[aria-describedby]").forEach(el=>{
      el.removeAttribute("aria-labelledby");
      el.removeAttribute("aria-describedby");
    });
  }

  function buildIosLaunch(){
    if(!phoneLite || document.querySelector(".ios-launch")) return Promise.resolve();

    const hero=document.querySelector(".hero");
    if(!hero) return Promise.resolve();

    return new Promise(resolve=>{
      const launch=document.createElement("div");
      launch.className="ios-launch";
      launch.setAttribute("aria-hidden","true");

      launch.innerHTML=`
        <div class="ios-launch-bg"></div>
        <div class="ios-launch-app-label">
          <span class="ios-launch-app-dot">◉</span>
          <span>Браузер</span>
        </div>
        <div class="ios-launch-side ios-launch-side-left" aria-hidden="true">
          <div class="ios-launch-side-bar"></div>
          <div class="ios-launch-side-lines"></div>
        </div>
        <div class="ios-launch-side ios-launch-side-right" aria-hidden="true">
          <div class="ios-launch-side-black"></div>
          <div class="ios-launch-side-lines"></div>
        </div>
        <div class="ios-launch-card">
          <div class="ios-launch-preview"></div>
          <div class="ios-launch-browser">
            <span class="ios-launch-browser-back">‹</span>
            <span class="ios-launch-address">eventmaks.ru</span>
            <span class="ios-launch-browser-menu">•••</span>
          </div>
        </div>`;

      const preview=launch.querySelector(".ios-launch-preview");
      const clone=hero.cloneNode(true);
      stripCloneIds(clone);

      clone.classList.add("ios-launch-hero-clone");
      clone.querySelector(".opening-screen")?.remove();
      clone.querySelector(".calc")?.remove();
      preview.appendChild(clone);

      document.body.appendChild(launch);
      document.body.classList.add("ios-launch-active");

      /* Force the real page itself to be ready underneath the preview.
         The clone is only a temporary visual representation of that exact DOM. */
      body.classList.add("hero-ready");
      if(noise) noise.classList.add("visible");

      /* V47: same slow feel, but the motion begins almost immediately.
         This removes the "stuck before opening" feeling on real phones. */
      window.setTimeout(()=>{
        requestAnimationFrame(()=>{
          requestAnimationFrame(()=>{
            launch.classList.add("ios-launch-run");
          });
        });
      },90);

      iosLaunchTimer=window.setTimeout(()=>{
        launch.classList.add("ios-launch-finish");
        window.setTimeout(()=>{
          launch.remove();
          document.body.classList.remove("ios-launch-active");
          iosLaunchDone=true;
          resolve();
        },100);
      },1840);
    });
  }

  phoneQuery.addEventListener("change",event=>{
    phoneLite=event.matches;
    body.classList.toggle("phone-lite",phoneLite);
  });
  // Quiz steps, fonts, and orientation can move later scroll scenes.
  const refreshLayout=[];
  let layoutFrame=0;
  if("ResizeObserver" in window){
    new ResizeObserver(()=>{
      if(layoutFrame) return;
      layoutFrame=requestAnimationFrame(()=>{
        layoutFrame=0;
        refreshLayout.forEach(refresh=>refresh());
      });
    }).observe(body);
  }

  const phrases=[
    "ОРГАНИЗАТОР - КООРДИНАТОР МЕРОПРИЯТИЙ",
    "И ПРОСТО ХОРОШИЙ ЧЕЛОВЕК"
  ];

  function begin(){
    if(phoneLite){
      /*
        V50 MOBILE INTRO:
        1) keep the branded screen fully visible long enough to read;
        2) then open the two paper halves;
        3) hide the intro only after that animation has actually finished.
      */
      if(noise) noise.classList.add("visible");

      window.setTimeout(()=>{
        body.classList.add("hero-ready");
      },1350);

      window.setTimeout(()=>{
        body.classList.add("hero-opened");
      },3350);

      return;
    }

    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        body.classList.add("hero-ready");
        if(noise) noise.classList.add("visible");
      });
    });

    setTimeout(()=>body.classList.add("hero-opened"),1900);
  }

  let started=false;
  const startOnce=()=>{
    if(started) return;
    started=true;
    begin();
  };

  if(phoneLite){
    /* Mobile opening starts immediately; font loading continues underneath.
       This removes the visible pre-animation pause on refresh. */
    requestAnimationFrame(startOnce);
  }else if(document.fonts && document.fonts.ready){
    Promise.race([
      document.fonts.ready,
      new Promise(resolve=>setTimeout(resolve,650))
    ]).then(startOnce);
  }else{
    window.addEventListener("load",startOnce,{once:true});
    setTimeout(startOnce,650);
  }

  // Same typewriter mechanics on desktop and phone.
  // Both phrases are typed, held, erased, then the next phrase is typed.
  if(typed){
    let phraseIndex=0;
    let charIndex=0;
    let deleting=false;
    let heroTypingVisible=true;
    let typingTimer=0;

    const TYPE_SPEED=phoneLite ? 58 : 54;
    const DELETE_SPEED=phoneLite ? 30 : 26;
    const HOLD_AFTER_TYPED=1650;
    const HOLD_BEFORE_NEXT=320;

    const heroForTyping=document.querySelector(".hero");
    if(heroForTyping && "IntersectionObserver" in window){
      const typingObserver=new IntersectionObserver(entries=>{
        heroTypingVisible=entries.some(entry=>entry.isIntersecting);
      },{threshold:.03});
      typingObserver.observe(heroForTyping);
    }

    function typeLoop(){
      if(!heroTypingVisible){
        typingTimer=window.setTimeout(typeLoop,300);
        return;
      }

      const phrase=phrases[phraseIndex];

      if(!deleting){
        charIndex+=1;
        typed.textContent=phrase.slice(0,charIndex);

        if(charIndex>=phrase.length){
          deleting=true;
          typingTimer=window.setTimeout(typeLoop,HOLD_AFTER_TYPED);
          return;
        }

        typingTimer=window.setTimeout(typeLoop,TYPE_SPEED);
        return;
      }

      charIndex-=1;
      typed.textContent=phrase.slice(0,Math.max(0,charIndex));

      if(charIndex<=0){
        deleting=false;
        phraseIndex=(phraseIndex+1)%phrases.length;
        typingTimer=window.setTimeout(typeLoop,HOLD_BEFORE_NEXT);
        return;
      }

      typingTimer=window.setTimeout(typeLoop,DELETE_SPEED);
    }

    // Start once the opening screen has started to clear.
    typingTimer=window.setTimeout(typeLoop,1100);
  }

  if(noise){
    if(phoneLite){
      noise.style.backgroundPosition="50% 50%";
    }else{
      let noiseActive=true;
      let noiseTimer=0;

      const tickNoise=()=>{
        if(noiseActive){
          noise.style.backgroundPosition=
            `${Math.floor(Math.random()*100)}% ${Math.floor(Math.random()*100)}%`;
        }
        noiseTimer=window.setTimeout(tickNoise,130);
      };

      const heroForNoise=document.querySelector(".hero");
      if(heroForNoise && "IntersectionObserver" in window){
        const noiseObserver=new IntersectionObserver(entries=>{
          noiseActive=entries.some(entry=>entry.isIntersecting);
        },{threshold:0});
        noiseObserver.observe(heroForNoise);
      }

      tickNoise();
    }
  }

  /* ========================================================
     SHOWREEL — optimized reference-driven scroll scene
     ======================================================== */
  const srScene=document.getElementById("showreel");
  const srStage=document.getElementById("showreelStage");
  const srVideo=document.getElementById("showreelVideo");
  const srMask=document.getElementById("showreelMask");
  const srHole=document.getElementById("showreelHole");
  const srMaskBase=document.getElementById("showreelMaskBase");
  const srPaper=document.getElementById("showreelPaper");
  const srRing=document.getElementById("showreelRing");
  const srArrow=document.getElementById("showreelArrow");
  const srLeftLabel=document.getElementById("showreelLeftLabel");
  const srRightLabel=document.getElementById("showreelRightLabel");
  const srSound=document.getElementById("showreelSound");

  const srClamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const srSmooth=t=>t*t*(3-2*t);

  let srMetrics={
    vw:window.innerWidth,
    vh:window.innerHeight,
    sceneTop:0,
    sceneHeight:0
  };
  let srLastMode="";
  let srRAF=0;

  function srRefreshMetrics(){
    if(!srScene) return;

    const vw=window.innerWidth;
    const vh=phoneLite ? srStage.clientHeight : window.innerHeight;
    srMetrics={
      vw,
      vh,
      sceneTop:srScene.offsetTop,
      sceneHeight:srScene.offsetHeight
    };

    if(srMask && srHole && srMaskBase && srPaper){
      srMask.setAttribute("viewBox",`0 0 ${vw} ${vh}`);
      if(phoneLite) srMask.setAttribute("preserveAspectRatio","none");
      srMaskBase.setAttribute("width",vw);
      srMaskBase.setAttribute("height",vh);
      srPaper.setAttribute("width",vw);
      srPaper.setAttribute("height",vh);
    }
  }

  function srApply(entry){
    if(!srScene || !srStage || !srMask || !srHole) return;

    const {vw,vh}=srMetrics;
    const mobile=vw<1200;
    const cxPct=mobile ? 50 : 37.5;

    /*
      Phone transition starts higher, like the desktop scene:
      the small circle becomes visible soon after Hero ends and then
      travels toward the center while opening.
    */
    const cyStart=phoneLite ? 14 : (mobile ? 7 : 5);
    const cyEnd=phoneLite ? 50 : (mobile ? 32 : 50);
    const cyPct=cyStart+(cyEnd-cyStart)*Math.pow(entry,1.18);

    const cxPx=vw*(cxPct/100);
    const cyPx=vh*(cyPct/100);

    /* Update shared UI positions. */
    srStage.style.setProperty("--cx",`${cxPct}%`);
    srStage.style.setProperty("--cy",`${cyPct}%`);

    const farX=Math.max(cxPx,vw-cxPx);
    const farY=Math.max(cyPx,vh-cyPx);
    const requiredRadius=Math.sqrt(farX*farX+farY*farY)+28;

    if(phoneLite){
      /*
        Phone reference behavior:
        the circle first enters the viewport small, then opens while the
        user scrolls. Because entry is derived from scroll position, the
        same motion runs backwards when the user scrolls up.
      */
      /*
        Start the reveal much earlier on phone.
        Previously .47 meant almost half a viewport of plain paper before
        the opening felt alive.
      */
      const g=srClamp((entry-.12)/.70);
      const open=srSmooth(g);
      const radius=52+(requiredRadius-52)*open;

      srHole.setAttribute("cx",cxPx.toFixed(1));
      srHole.setAttribute("cy",cyPx.toFixed(1));
      srHole.setAttribute("r",radius.toFixed(1));
      srMask.style.opacity="1";

      if(srRing){
        const ringFade=srSmooth(srClamp((g-.24)/.34));
        const rotation=42*srSmooth(srClamp(g/.68));
        srRing.style.setProperty("--sr-ring-opacity",String(1-ringFade));
        srRing.style.setProperty("--sr-ring-rot",`${rotation.toFixed(2)}deg`);
      }

      if(srArrow){
        srArrow.style.opacity="0";
      }

      if(srLeftLabel) srLeftLabel.style.opacity="0";
      if(srRightLabel) srRightLabel.style.opacity="0";

      if(srSound){
        const soundOpacity=srSmooth(srClamp((g-.76)/.18));
        srSound.style.opacity=String(soundOpacity);
        srSound.style.pointerEvents=soundOpacity>.82 ? "auto" : "none";
      }
    }else{
      /*
        Desktop/tablet behavior stays unchanged.
      */
      const g=srClamp((entry-.50)/.50);
      const accel=Math.pow(g,3);
      const radius=70+(requiredRadius-70)*accel;

      srHole.setAttribute("cx",cxPx.toFixed(1));
      srHole.setAttribute("cy",cyPx.toFixed(1));
      srHole.setAttribute("r",radius.toFixed(1));

      const maskFade=srSmooth(srClamp((g-.94)/.06));
      srMask.style.opacity=String(1-maskFade);

      if(srRing){
        const rotation=105*srSmooth(srClamp(g/.78));
        const ringFade=srSmooth(srClamp((g-.80)/.18));
        srRing.style.transform=`rotate(${rotation.toFixed(2)}deg)`;
        srRing.style.opacity=String(1-ringFade);
      }

      if(srArrow){
        const arrowFade=srSmooth(srClamp((entry-.56)/.16));
        srArrow.style.opacity=String(1-arrowFade);
        srArrow.style.transform=`rotate(${(8-8*arrowFade).toFixed(2)}deg) translateX(${(-8*arrowFade).toFixed(2)}px)`;
      }

      const labels=srSmooth(srClamp((g-.73)/.20));
      if(srLeftLabel) srLeftLabel.style.opacity=String(labels);
      if(srRightLabel) srRightLabel.style.opacity=String(labels);

      if(srSound){
        const soundOpacity=srSmooth(srClamp((g-.90)/.10));
        srSound.style.opacity=String(soundOpacity);
        srSound.style.pointerEvents=soundOpacity>.85 ? "auto" : "none";
      }
    }

    if(srVideo && srVideo.paused && !phoneLite){
      srVideo.play().catch(()=>{});
    }
  }

  function srUpdate(){
    if(!srScene) return;

    const {vh,sceneTop,sceneHeight}=srMetrics;
    const scrollY=window.scrollY || window.pageYOffset || 0;

    /*
      Do not continuously recompute styles while the user is several
      sections away from the video. This matters on long pages and on
      fast reverse scrolling back toward the showreel.
    */
    const activeStart=sceneTop-vh*1.15;
    const activeEnd=sceneTop+sceneHeight+vh*.35;

    if(scrollY<activeStart){
      if(srLastMode!=="before"){
        srLastMode="before";
        srApply(0);
      }
      return;
    }

    if(scrollY>activeEnd){
      if(srLastMode!=="after"){
        srLastMode="after";
        srApply(1);
      }
      return;
    }

    srLastMode="active";

    /*
      Equivalent to the old getBoundingClientRect calculation,
      but without forcing layout on every scroll frame.
    */
    const rectTop=sceneTop-scrollY;
    const entry=srClamp((vh-rectTop)/vh);
    srApply(entry);
  }

  function srRequest(){
    if(srRAF) return;
    srRAF=requestAnimationFrame(()=>{
      srRAF=0;
      srUpdate();
    });
  }

  function srResize(){
    srRefreshMetrics();
    srLastMode="";
    srRequest();
  }

  refreshLayout.push(srResize);
  srRefreshMetrics();
  if(phoneLite){
    if(srVideo){
      srVideo.autoplay=true;
      srVideo.preload="metadata";
      srVideo.muted=true;

      if("IntersectionObserver" in window){
        const showreelMobileObserver=new IntersectionObserver(entries=>{
          entries.forEach(entry=>{
            if(entry.isIntersecting && entry.intersectionRatio>.08){
              srVideo.play().catch(()=>{});
            }else{
              srVideo.pause();
            }
          });
        },{threshold:[0,.08,.45]});
        showreelMobileObserver.observe(srStage || srVideo);
      }else{
        srVideo.play().catch(()=>{});
      }
    }

    if(srMask) srMask.style.display="block";
    if(srRing) srRing.style.pointerEvents="none";

    window.addEventListener("scroll",srRequest,{passive:true});
    window.addEventListener("resize",srResize,{passive:true});
    window.addEventListener("load",srResize,{once:true});
    srLastMode="";
    srUpdate();
  }else{
    window.addEventListener("scroll",srRequest,{passive:true});
    window.addEventListener("resize",srResize,{passive:true});
    window.addEventListener("load",srResize,{once:true});
    srUpdate();
  }

  if(srSound && srVideo){
    srSound.addEventListener("click",()=>{
      srVideo.muted=!srVideo.muted;
      srVideo.play().catch(()=>{});
      srSound.textContent=srVideo.muted ? "ВКЛЮЧИТЬ ЗВУК" : "ВЫКЛЮЧИТЬ ЗВУК";
    });
  }


  /* ========================================================
     TEAM — reveal only
     ======================================================== */
  const teamReveal=[...document.querySelectorAll(".team-reveal")];

  if("IntersectionObserver" in window && teamReveal.length){
    const teamObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          teamObserver.unobserve(entry.target);
        }
      });
    },{
      threshold:.14,
      rootMargin:"0px 0px -6% 0px"
    });

    teamReveal.forEach((el,index)=>{
      el.style.transitionDelay=`${Math.min(index*70,280)}ms`;
      teamObserver.observe(el);
    });
  }else{
    teamReveal.forEach(el=>el.classList.add("is-visible"));
  }


  /* ========================================================
     PORTFOLIO — gentle reveal
     ======================================================== */
  const portfolioReveal=[...document.querySelectorAll(".portfolio-reveal")];

  if("IntersectionObserver" in window && portfolioReveal.length){
    const portfolioObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          portfolioObserver.unobserve(entry.target);
        }
      });
    },{
      threshold:.08,
      rootMargin:"0px 0px -5% 0px"
    });

    portfolioReveal.forEach((el,index)=>{
      el.style.transitionDelay=`${Math.min(index*45,180)}ms`;
      portfolioObserver.observe(el);
    });
  }else{
    portfolioReveal.forEach(el=>el.classList.add("is-visible"));
  }


  /* ========================================================
     QUIZ — 4-step calculator
     ======================================================== */
  const quizSteps=[...document.querySelectorAll(".quiz-step")];
  const quizNext=document.getElementById("quizNext");
  const quizBack=document.getElementById("quizBack");
  const quizCurrent=document.getElementById("quizStepCurrent");
  const quizProgress=document.getElementById("quizProgressFill");

  let quizStep=1;
  const quizAnswers={};

  function getQuizStep(){
    return quizSteps.find(el=>Number(el.dataset.step)===quizStep);
  }

  function quizHasAnswer(step){
    if(step>=5) return true;
    return Boolean(quizAnswers[step]);
  }

  function renderQuiz(){
    quizSteps.forEach(el=>{
      el.classList.toggle("is-active",Number(el.dataset.step)===quizStep);
    });

    const quizCard=document.querySelector(".quiz-card");
    if(quizCard){
      quizCard.dataset.quizStep=quizStep>=5 ? "✓" : String(quizStep).padStart(2,"0");
    }

    const quizStepVisual=document.getElementById("quizStepVisual");
    if(quizStepVisual){
      const visualParent=quizStepVisual.closest(".quiz-step-visual");
      if(visualParent) visualParent.classList.add("is-changing");

      window.setTimeout(()=>{
        quizStepVisual.textContent=quizStep>=5 ? "✓" : String(quizStep).padStart(2,"0");
        if(visualParent) visualParent.classList.remove("is-changing");
      },120);
    }

    const quizDots=[...document.querySelectorAll("#quizDots i")];
    quizDots.forEach((dot,index)=>{
      dot.classList.toggle("is-active",index===Math.min(quizStep,4)-1);
    });

    if(quizCurrent){
      quizCurrent.textContent=String(Math.min(quizStep,4));
    }

    if(quizProgress){
      const pct=quizStep>=5 ? 100 : quizStep*25;
      quizProgress.style.width=`${pct}%`;
    }

    if(quizBack){
      quizBack.disabled=quizStep===1;
      quizBack.style.visibility=quizStep>=5 ? "hidden" : "visible";
    }

    if(quizNext){
      if(quizStep>=5){
        quizNext.style.display="none";
      }else{
        quizNext.style.display="flex";
        quizNext.disabled=!quizHasAnswer(quizStep);
        const label=quizNext.querySelector("span");
        if(label){
          label.textContent=quizStep===4 ? "Получить результат" : "Следующий вопрос";
        }
      }
    }

    const footer=document.querySelector(".quiz-footer");
    if(footer){
      footer.style.display=quizStep>=5 ? "none" : "flex";
    }
  }

  quizSteps.forEach(stepEl=>{
    stepEl.querySelectorAll(".quiz-option").forEach(btn=>{
      btn.addEventListener("click",()=>{
        stepEl.querySelectorAll(".quiz-option").forEach(x=>x.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        quizAnswers[Number(stepEl.dataset.step)]=btn.dataset.value || btn.textContent.trim();
        if(quizNext) quizNext.disabled=false;
      });
    });
  });

  if(quizNext){
    quizNext.addEventListener("click",()=>{
      if(!quizHasAnswer(quizStep)) return;
      quizStep=Math.min(5,quizStep+1);
      renderQuiz();
    });
  }

  if(quizBack){
    quizBack.addEventListener("click",()=>{
      quizStep=Math.max(1,quizStep-1);
      renderQuiz();
    });
  }

  renderQuiz();


  /* ========================================================
     BENEFITS — reference-like reversible scroll reveal
     ======================================================== */
  const benefitsSection=document.querySelector(".benefits-section");

  if(benefitsSection){
    const benefitsTitle=benefitsSection.querySelector(".benefits-title");
    const benefitsCards=[...benefitsSection.querySelectorAll(".benefit-card")];

    const bClamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
    const bEase=t=>t*t*(3-2*t);

    let bRAF=0;
    let bVH=window.innerHeight;
    let bSectionTop=0;
    let bSectionBottom=0;
    let bTitleY=0;
    let bCardY=[];

    function bRefresh(){
      const scrollY=window.scrollY || window.pageYOffset || 0;
      bVH=window.innerHeight;

      const sectionRect=benefitsSection.getBoundingClientRect();
      bSectionTop=sectionRect.top+scrollY;
      bSectionBottom=sectionRect.bottom+scrollY;

      if(benefitsTitle){
        const r=benefitsTitle.getBoundingClientRect();
        bTitleY=r.top+scrollY;
      }

      bCardY=benefitsCards.map(card=>{
        const r=card.getBoundingClientRect();
        return r.top+scrollY;
      });
    }

    /*
      This is the important part:
      progress is calculated from the REAL viewport position every frame.
      No played/visible flag is stored, therefore reverse scroll naturally
      produces 1 -> 0 with exactly the same easing.
    */
    function bViewportProgress(pageY, scrollY, startRatio, endRatio){
      const y=pageY-scrollY;
      const start=bVH*startRatio;
      const end=bVH*endRatio;
      return bEase(bClamp((start-y)/(start-end)));
    }

    function bSetAll(value){
      const v=String(value);
      benefitsSection.style.setProperty("--benefits-title-p",v);
      benefitsSection.style.setProperty("--benefits-line-p",v);
      benefitsCards.forEach(card=>card.style.setProperty("--card-p",v));
    }

    function bRender(){
      bRAF=0;
      const scrollY=window.scrollY || window.pageYOffset || 0;

      /*
        Extra visual layer only: a slow 0..1 section progress used by
        the splatter / ambient word / doodle. It never changes card reveal.
      */
      const benefitsSceneRaw=bClamp(
        (scrollY-(bSectionTop-bVH*.92)) /
        Math.max(1,(bSectionBottom-bSectionTop)+bVH*.72)
      );
      const benefitsSceneP=bEase(benefitsSceneRaw);
      benefitsSection.style.setProperty("--benefits-scene-p",benefitsSceneP.toFixed(4));

      /*
        Explicitly reset states outside the block.
        This is what the previous version was missing:
        when returning above the section, everything MUST be back at 0.
      */
      if(scrollY <= bSectionTop-bVH*.92){
        bSetAll(0);
        return;
      }

      if(scrollY >= bSectionBottom-bVH*.16){
        bSetAll(1);
        return;
      }

      /* Title opens a little before the first card. */
      const titleP=bViewportProgress(bTitleY,scrollY,.91,.73);
      benefitsSection.style.setProperty("--benefits-title-p",titleP.toFixed(4));

      let furthest=0;

      benefitsCards.forEach((card,index)=>{
        /*
          The reference transition happens over a relatively short piece
          of scrolling: a pale rectangle appears near the lower part of
          the viewport and becomes fully blue roughly 150–200px later.
        */
        const p=bViewportProgress(bCardY[index],scrollY,.835,.665);
        card.style.setProperty("--card-p",p.toFixed(4));

        /*
          Timeline grows by quarters as each successive card opens.
          Example:
            card 1 -> 0...25%
            card 2 -> 25...50%
            etc.
        */
        const lineHere=(index+p)/benefitsCards.length;
        if(p>0 || index===0){
          furthest=Math.max(furthest,lineHere);
        }
      });

      /*
        If a later card is already fully open, the line must reach it.
        Determine the furthest card that has any progress.
      */
      let lineP=0;
      benefitsCards.forEach((card,index)=>{
        const p=parseFloat(card.style.getPropertyValue("--card-p") || "0");
        if(p>0){
          lineP=Math.max(lineP,(index+p)/benefitsCards.length);
        }
      });

      benefitsSection.style.setProperty("--benefits-line-p",bClamp(lineP).toFixed(4));
    }

    function bRequest(){
      if(bRAF) return;
      bRAF=requestAnimationFrame(bRender);
    }

    function bResize(){
      bRefresh();
      bRequest();
    }

    refreshLayout.push(bResize);
    bRefresh();

    /* Same reversible reveal on desktop and phone:
       scrolling down opens each card progressively;
       scrolling back up closes it along the same curve. */
    window.addEventListener("scroll",bRequest,{passive:true});
    window.addEventListener("resize",bResize,{passive:true});
    window.addEventListener("load",bResize,{once:true});
    bRender();
  }


  /* ========================================================
     CONTRACT V6 — delayed, visible heart writing
     ======================================================== */
  const contractRefSection=document.querySelector(".contract-ref");
  const contractPenMover=document.getElementById("contractRefPenMover");
  const contractHeartPath=document.getElementById("contractHeartPath");

  if(contractRefSection && contractPenMover && contractHeartPath){
    const crClamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
    const crEase=t=>t*t*(3-2*t);

    let crRAF=0;
    let crTop=0;
    let crVH=window.innerHeight;
    let heartLength=0;

    function crRefresh(){
      const scrollY=window.scrollY || window.pageYOffset || 0;
      const r=contractRefSection.getBoundingClientRect();

      crTop=r.top+scrollY;
      crVH=window.innerHeight;

      heartLength=contractHeartPath.getTotalLength();
      contractHeartPath.style.strokeDasharray=`${heartLength}`;
    }

    function crPlacePen(writeP){
      if(!heartLength) return;

      const length=heartLength*writeP;
      const pt=contractHeartPath.getPointAtLength(length);

      const delta=Math.max(1.2,heartLength*.014);
      const p0=contractHeartPath.getPointAtLength(Math.max(0,length-delta));
      const p1=contractHeartPath.getPointAtLength(Math.min(heartLength,length+delta));

      const tangent=Math.atan2(p1.y-p0.y,p1.x-p0.x)*180/Math.PI;
      const tangentAdjustment=crClamp(tangent,-44,44)*.48;

      contractPenMover.setAttribute(
        "transform",
        `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)}) rotate(${tangentAdjustment.toFixed(2)})`
      );
    }

    function crRender(){
      crRAF=0;

      const scrollY=window.scrollY || window.pageYOffset || 0;
      const sectionY=crTop-scrollY;

      /*
        Visual paper entrance starts earlier than the actual signature.
        This does NOT alter heart timing or the pen path.
      */
      const sceneStart=crVH*.90;
      const sceneEnd=crVH*.51;
      const sceneRaw=crClamp((sceneStart-sectionY)/(sceneStart-sceneEnd));
      const sceneP=crEase(sceneRaw);

      contractRefSection.style.setProperty("--contract-scene-p",sceneP.toFixed(4));

      /*
        Extremely small physical paper drift while scrolling. It stays under
        4px and disappears by the time the signature is nearly complete.
      */
      const paperDrift=(Math.sin(sceneP*Math.PI)*-3.5);
      contractRefSection.style.setProperty("--contract-paper-y",`${paperDrift.toFixed(2)}px`);

      /*
        IMPORTANT CHANGE:
        V5 started too early at ~72% of viewport height.
        V6 waits until the whole contract block is already clearly visible.

        Writing now starts only when the top of the section reaches ~47% of the
        viewport, and continues until it reaches ~5%.
      */
      const writeStart=crVH*.47;
      const writeEnd=crVH*.05;

      const raw=crClamp((writeStart-sectionY)/(writeStart-writeEnd));
      const writeP=crEase(raw);

      contractRefSection.style.setProperty("--pen-p",writeP.toFixed(4));

      if(heartLength){
        contractHeartPath.style.strokeDashoffset=
          `${(heartLength*(1-writeP)).toFixed(3)}`;
      }

      /* Heart is hidden before the pen actually begins writing. */
      contractHeartPath.style.opacity=writeP>.008 ? "1" : "0";

      crPlacePen(writeP);

      /*
        Pen behaviour:
        - before writing: visible and resting at the start point;
        - during writing: fully visible;
        - after writing: remains beside the finished heart.
      */
      if(writeP<=.008){
        contractPenMover.style.opacity=".84";
      }else if(writeP>=.995){
        contractPenMover.style.opacity=".80";
      }else{
        contractPenMover.style.opacity="1";
      }
    }

    function crRequest(){
      if(crRAF) return;
      crRAF=requestAnimationFrame(crRender);
    }

    function crResize(){
      crRefresh();
      crRequest();
    }

    refreshLayout.push(crResize);
    crRefresh();

    crPlacePen(0);
    window.addEventListener("scroll",crRequest,{passive:true});
    window.addEventListener("resize",crResize,{passive:true});
    window.addEventListener("load",crResize,{once:true});
    crRender();
  }



  /* ========================================================
     COST V7 — exact reference-style coin trajectory
     ======================================================== */
  const costSection=document.querySelector(".cost-section");
  const costStage=document.getElementById("costStage");
  const costPug=document.getElementById("costPug");
  const costTreat=document.getElementById("costTreat");
  const costCard=document.querySelector(".cost-card");

  if(costSection && costStage && costPug && costTreat && costCard){
    const cClamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
    const cSmoother=t=>t*t*t*(t*(t*6-15)+10);

    let cRAF=0;
    let cCurrent=0;
    let cTarget=0;
    let cProgressReady=false;
    let cScrollActive=false;
    let cScrollStopTimer=0;

    function cubic(t,p0,p1,p2,p3){
      const u=1-t;
      const uu=u*u;
      const tt=t*t;
      return {
        x:uu*u*p0.x + 3*uu*t*p1.x + 3*u*tt*p2.x + tt*t*p3.x,
        y:uu*u*p0.y + 3*uu*t*p1.y + 3*u*tt*p2.y + tt*t*p3.y
      };
    }

    function tangent(t,p0,p1,p2,p3){
      const u=1-t;
      return {
        x:3*u*u*(p1.x-p0.x) + 6*u*t*(p2.x-p1.x) + 3*t*t*(p3.x-p2.x),
        y:3*u*u*(p1.y-p0.y) + 6*u*t*(p2.y-p1.y) + 3*t*t*(p3.y-p2.y)
      };
    }

    function cRender(){
      cRAF=0;

      const vh=window.innerHeight;
      const sectionRect=costSection.getBoundingClientRect();
      if(phoneLite && (sectionRect.bottom < -80 || sectionRect.top > vh+160)) return;
      const stageRect=costStage.getBoundingClientRect();
      const pugRect=costPug.getBoundingClientRect();
      const cardRect=costCard.getBoundingClientRect();

      /*
        Long reversible scroll range, but WITHOUT creating an oversized section.
        The path begins while the cost block is entering the viewport and
        finishes near the moment the block approaches the top.
      */
      const start=vh*.92;

      let raw;
      if(phoneLite){
        /*
          Mobile timing is tied to the actual dog position.
          The treat reaches the mouth when the pug has entered the lower
          part of the viewport instead of finishing while the dog is still
          below the screen.
        */
        const pugOffset=pugRect.top-sectionRect.top;
        const arrivalSectionTop=(vh*.70)-pugOffset;
        const denominator=Math.max(1,start-arrivalSectionTop);
        raw=cClamp((start-sectionRect.top)/denominator);
      }else{
        const end=vh*.02;
        raw=cClamp((start-sectionRect.top)/(start-end));
      }

      /*
        V57 — ULTRA SLOW + PHYSICALLY SMOOTH FOLLOW TIMING
        Do not jump directly to the scroll position.
        Instead, let the treat ease toward the target progress so the motion
        feels slower, softer, and more continuous on every frame.
      */
      cTarget=raw;
      if(!cProgressReady){
        cCurrent=cTarget;
        cProgressReady=true;
      }

      const follow=phoneLite ? 0.045 : 0.055;
      cCurrent += (cTarget-cCurrent)*follow;
      if(Math.abs(cTarget-cCurrent) < 0.0007) cCurrent=cTarget;

      /*
        V69 — CONTINUOUS MOTION TIMING
        The old ^4.9 curve compressed most of the visible motion toward the
        end of the scroll range, which created a sudden acceleration before
        the drop. A quintic smootherstep keeps both velocity and acceleration
        soft at the beginning and at the mouth.
      */
      const t=cSmoother(cClamp(cCurrent));
      costStage.style.setProperty("--cost-p",t.toFixed(4));

      /*
        V69 — ONE CONTINUOUS CURVE, NO HARD CORNER

        Previous versions split the route into three independent pieces:
        horizontal -> vertical -> mouth. Even with easing, the direction
        changed at a geometric corner and still looked like a sudden drop.

        The visible route is now one cubic Bézier curve. The first control
        point keeps the beginning almost horizontal; the second control point
        pulls the route gently around the right side of the card and into the
        dog's mouth. There is no segment boundary and therefore no direction
        snap.
      */
      const mouth={
        x:(pugRect.left-stageRect.left)+(pugRect.width*.415),
        y:(pugRect.top-stageRect.top)+(pugRect.height*.338)
      };

      const horizontalY=(cardRect.top-stageRect.top)-18;
      const cornerX=Math.max(
        (cardRect.right-stageRect.left)+(phoneLite ? 16 : 28),
        mouth.x-(phoneLite ? 20 : 28)
      );

      let pt;

      if(phoneLite){
        /*
          V70 — MOBILE ONLY: STRICT VERTICAL COLUMN LINE

          On phones the treat must not arc, drift sideways or make a final
          horizontal correction. Its X coordinate is locked to the existing
          vertical fall lane beside the card for the entire animation. Only Y
          changes, so the route is mathematically straight from top to bottom.

          Desktop intentionally keeps the V69 continuous Bézier trajectory.
        */
        /*
          V71 — lock to the REAL mobile fall column, not to the old shared
          corner/mouth calculation. The lane is defined once from the right
          edge of the mobile cost card and never changes while scrolling.
        */
        const mobileLineX=(cardRect.right-stageRect.left)+16;
        pt={
          x:mobileLineX,
          y:horizontalY+(mouth.y-horizontalY)*t
        };
      }else{
        const startPoint={
          x:(cardRect.left-stageRect.left)+(cardRect.width*.08),
          y:horizontalY
        };

        const control1={
          x:startPoint.x+(cornerX-startPoint.x)*.76,
          y:horizontalY
        };

        const control2={
          x:cornerX+34,
          y:horizontalY+(mouth.y-horizontalY)*.32
        };

        /*
          A cubic Bézier does not move at perfectly even visual speed when its
          parameter advances evenly. Remap progress through a small arc-length
          lookup so the biscuit does not suddenly speed up while rounding the
          bend.
        */
        const samples=36;
        const lengths=[0];
        let totalLength=0;
        let prevPoint=startPoint;
        for(let i=1;i<=samples;i++){
          const samplePoint=cubic(i/samples,startPoint,control1,control2,mouth);
          totalLength+=Math.hypot(samplePoint.x-prevPoint.x,samplePoint.y-prevPoint.y);
          lengths.push(totalLength);
          prevPoint=samplePoint;
        }

        const targetLength=t*totalLength;
        let sampleIndex=1;
        while(sampleIndex<lengths.length && lengths[sampleIndex]<targetLength){
          sampleIndex++;
        }
        const segmentStart=lengths[sampleIndex-1] || 0;
        const segmentEnd=lengths[sampleIndex] || totalLength || 1;
        const segmentMix=cClamp((targetLength-segmentStart)/Math.max(.0001,segmentEnd-segmentStart));
        const curveT=((sampleIndex-1)+segmentMix)/samples;
        pt=cubic(curveT,startPoint,control1,control2,mouth);
      }

      const angle=0;

      /*
        V57 — EATEN AT THE MOUTH
        The treat stays visible almost until contact, then softly disappears
        at the mouth so the dog appears to eat it.
      */
      let scale=1;
      let opacity=1;
      /* V69: longer, softer final bite instead of a last-moment pop. */
      const swallow=cSmoother(cClamp((t-.962)/.038));
      scale=1-(swallow*.88);
      opacity=1-swallow;

      costTreat.style.transform=
        `translate3d(${pt.x.toFixed(2)}px,${pt.y.toFixed(2)}px,0) `+
        `translate(-12%,-50%) rotate(${angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

      /*
        V68 — SAME TREAT VISIBILITY ON DESKTOP + MOBILE.
        Never hide the treat because scroll events pause. It stays visible
        all along the route and fades only at the final bite into the dog.
      */
      costTreat.style.setProperty("display","block","important");
      costTreat.style.setProperty("opacity",opacity.toFixed(3),"important");
      costTreat.style.setProperty("visibility",opacity > 0.02 ? "visible" : "hidden","important");

      if(Math.abs(cTarget-cCurrent) > 0.0007){
        cRAF=requestAnimationFrame(cRender);
      }
    }

    function cRequest(){
      if(cRAF) return;
      cRAF=requestAnimationFrame(cRender);
    }

    function cOnScroll(){
      cScrollActive=true;
      clearTimeout(cScrollStopTimer);
      cRequest();
      cScrollStopTimer=setTimeout(()=>{
        cScrollActive=false;
      },110);
    }

    costTreat.style.setProperty("display","block","important");
    costTreat.style.setProperty("opacity","1","important");
    costTreat.style.setProperty("visibility","visible","important");
    window.addEventListener("scroll",cOnScroll,{passive:true});
    window.addEventListener("resize",cRequest,{passive:true});
    window.addEventListener("load",cRequest,{once:true});
    cRender();
  }






  /* ========================================================
     REVIEWS V2 — horizontal reference-like carousel
     ======================================================== */
  const reviewsTrack=document.getElementById("reviewsTrack");
  const reviewsViewport=document.getElementById("reviewsViewport");
  const reviewsPrev=document.getElementById("reviewsPrev");
  const reviewsNext=document.getElementById("reviewsNext");

  if(reviewsTrack && reviewsViewport && reviewsPrev && reviewsNext){
    const reviewsSection=document.getElementById("reviews");
    const reviewSlides=[...reviewsTrack.querySelectorAll(".review-slide")];

    let reviewsIndex=0;
    let reviewsBaseTarget=0;
    let reviewsRAF=0;

    const rClamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
    const rEase=value=>value*value*(3-2*value);

    function reviewsMetrics(){
      const first=reviewsTrack.querySelector(".review-slide");
      if(!first) return {step:319,max:0};

      const styles=getComputedStyle(reviewsTrack);
      const gap=parseFloat(styles.gap || styles.columnGap || "0") || 0;
      const step=first.getBoundingClientRect().width+gap;

      /*
        scrollWidth already includes track padding.
        Do not add paddingLeft twice.
      */
      const max=Math.max(
        0,
        reviewsTrack.scrollWidth-reviewsViewport.clientWidth
      );

      return {step,max};
    }

    function reviewsSceneProgress(){
      if(!reviewsSection) return 0;

      const rect=reviewsSection.getBoundingClientRect();
      const vh=window.innerHeight || 1;
      const raw=(vh*.92-rect.top) /
        Math.max(1,(vh*.92)+(rect.height-vh*.12));

      return rEase(rClamp(raw));
    }

    function reviewsScrollRender(){
      reviewsRAF=0;

      if(phoneLite) return;
      const {max}=reviewsMetrics();
      const p=reviewsSceneProgress();

      /*
        The reference has a gentle horizontal drift while the page scrolls.
        Manual arrows remain primary. Drift only uses the remaining space,
        so it can never move beyond the last card.
      */
      const available=Math.max(0,max-reviewsBaseTarget);
      /*
        Desktop keeps the reference-like scroll drift.
        On phones the first card must never slide under the left viewport edge.
      */
      const driftRange=phoneLite
        ? Math.min(28,available)
        : (window.innerWidth<=1199 ? Math.min(58,available) : Math.min(135,available));
      const drift=-(driftRange*p);

      reviewsTrack.style.setProperty("--reviews-drift",`${drift.toFixed(2)}px`);

      if(reviewsSection){
        reviewsSection.style.setProperty("--reviews-scene-p",p.toFixed(4));
        reviewsSection.style.setProperty(
          "--reviews-wave-x",
          `${((p-.5)*-32).toFixed(2)}px`
        );
      }

      reviewSlides.forEach((slide,index)=>{
        const direction=index%2===0 ? 1 : -1;
        const amplitude=window.innerWidth<=1199 ? 1.8 : 4.2;
        const float=(p-.5)*amplitude*direction;
        slide.style.setProperty("--review-float",`${float.toFixed(2)}px`);
      });
    }

    function requestReviewsScrollRender(){
      if(phoneLite || reviewsRAF) return;
      reviewsRAF=requestAnimationFrame(reviewsScrollRender);
    }

    function reviewsRender(){
      const {step,max}=reviewsMetrics();
      const target=Math.min(max,reviewsIndex*step);
      reviewsBaseTarget=target;

      if(phoneLite){
        reviewsViewport.scrollTo({left:target,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
      }else{
        reviewsViewport.scrollLeft=0;
        reviewsTrack.style.setProperty("--reviews-shift",`${-target}px`);
      }

      reviewsPrev.disabled=reviewsIndex===0;
      reviewsPrev.style.opacity=reviewsIndex===0?".38":"1";

      const atEnd=target>=max-2;
      reviewsNext.disabled=atEnd;
      reviewsNext.style.opacity=atEnd?".38":"1";

      requestReviewsScrollRender();
    }

    reviewsViewport.addEventListener("scroll",()=>{
      if(!phoneLite) return;
      const {step,max}=reviewsMetrics();
      reviewsIndex=Math.round(reviewsViewport.scrollLeft/step);
      reviewsPrev.disabled=reviewsViewport.scrollLeft<2;
      reviewsNext.disabled=reviewsViewport.scrollLeft>=max-2;
      reviewsPrev.style.opacity=reviewsPrev.disabled ? ".38" : "1";
      reviewsNext.style.opacity=reviewsNext.disabled ? ".38" : "1";
    },{passive:true});

    reviewsPrev.addEventListener("click",()=>{
      reviewsIndex=Math.max(0,reviewsIndex-1);
      reviewsRender();
    });

    reviewsNext.addEventListener("click",()=>{
      reviewsIndex+=1;
      reviewsRender();
    });

    window.addEventListener("scroll",requestReviewsScrollRender,{passive:true});
    window.addEventListener("resize",()=>{
      reviewsRender();
      requestReviewsScrollRender();
    },{passive:true});
    window.addEventListener("load",()=>{
      reviewsRender();
      requestReviewsScrollRender();
    },{once:true});

    reviewsRender();
    reviewsScrollRender();
  }


  /* ========================================================
     FAQ — one-open-at-a-time accordion
     ======================================================== */
  const faqItems=[...document.querySelectorAll(".faq-item")];

  faqItems.forEach(item=>{
    const button=item.querySelector(".faq-question");
    if(!button) return;

    button.addEventListener("click",()=>{
      const willOpen=!item.classList.contains("is-open");

      faqItems.forEach(other=>{
        other.classList.remove("is-open");
        const otherButton=other.querySelector(".faq-question");
        if(otherButton) otherButton.setAttribute("aria-expanded","false");
      });

      if(willOpen){
        item.classList.add("is-open");
        button.setAttribute("aria-expanded","true");
      }
    });
  });

  /*
    Open the first answer by default, like the reference often shows one
    expanded card while the user explores the section.
  */
  if(faqItems[0]){
    faqItems[0].classList.add("is-open");
    const firstButton=faqItems[0].querySelector(".faq-question");
    if(firstButton) firstButton.setAttribute("aria-expanded","true");
  }

  /*
    Contact icons are visual placeholders until real Maksim contact links
    are supplied. Prevent the empty "#" links from jumping to the top.
  */
  document.querySelectorAll(".contact-app[href='#']").forEach(link=>{
    link.addEventListener("click",event=>event.preventDefault());
  });


  /* ========================================================
     YANDEX METRICA GOALS V77
     Goal transport is defined later, next to consent/Metrica loader.
     Event handlers call it only at the moment of a real user action.
     ======================================================== */
  const sendMetricaGoal=(goal,params={})=>{
    if(typeof window.eventmaksReachGoal!=="function") return false;
    return window.eventmaksReachGoal(goal,params);
  };

  /* Main conversion/navigation clicks. */
  document.addEventListener("click",event=>{
    const target=event.target instanceof Element ? event.target : null;
    if(!target) return;

    const link=target.closest("a");
    if(!link) return;

    const href=(link.getAttribute("href") || "").trim();

    if(link.classList.contains("contact-wa") || href.startsWith("https://wa.me/")){
      sendMetricaGoal("whatsapp_click",{source:"contact"});
      return;
    }

    if(link.classList.contains("contact-tg") || href.startsWith("tg://")){
      sendMetricaGoal("telegram_click",{source:"contact"});
      return;
    }

    if(href==="#calculator"){
      let source="other";
      if(link.classList.contains("calc")) source="floating";
      else if(link.classList.contains("cost-button")) source="cost";
      else if(link.classList.contains("faq-cta")) source="faq";
      sendMetricaGoal("calculator_cta",{source});
      return;
    }

    if(link.classList.contains("contact-call") || href.startsWith("tel:")){
      sendMetricaGoal("contact_action",{type:"phone"});
      return;
    }

    if(link.classList.contains("contact-mail") || href.startsWith("mailto:")){
      sendMetricaGoal("contact_action",{type:"email"});
    }
  });

  /* Track meaningful section views once per page. */
  if("IntersectionObserver" in window){
    const observeGoalOnce=(element,goal,threshold=.42)=>{
      if(!element) return;
      const observer=new IntersectionObserver(entries=>{
        const entry=entries[0];
        if(!entry?.isIntersecting) return;
        sendMetricaGoal(goal,{source:"scroll"});
        observer.disconnect();
      },{threshold});
      observer.observe(element);
    };

    observeGoalOnce(document.getElementById("portfolio"),"portfolio_view",.28);
    observeGoalOnce(document.getElementById("contact"),"contact_view",.32);
  }

  /* First real answer means the calculator was started. */
  let quizStartGoalSent=false;
  document.querySelectorAll("#calculator .quiz-option").forEach(option=>{
    option.addEventListener("click",()=>{
      if(quizStartGoalSent) return;
      quizStartGoalSent=true;
      sendMetricaGoal("calculator_start",{step:1});
    });
  });

  /* ========================================================
     QUIZ SUBMIT — send completed brief to Maksim via WhatsApp
     ======================================================== */
  const quizSubmit=document.querySelector(".quiz-submit");
  const quizResultForm=document.querySelector(".quiz-result-form");

  if(quizSubmit && quizResultForm){
    const nameInput=quizResultForm.querySelector('input[name="name"]');
    const phoneInput=quizResultForm.querySelector('input[name="phone"]');
    const dateInput=quizResultForm.querySelector('input[name="date"]');
    const consentInput=quizResultForm.querySelector('#privacyConsent');
    const consentRow=quizResultForm.querySelector('#quizConsentRow');

    [nameInput,phoneInput,dateInput].filter(Boolean).forEach(input=>{
      input.addEventListener("input",()=>input.classList.remove("is-error"));
    });

    if(consentInput && consentRow){
      consentInput.checked=false;
      consentInput.addEventListener("change",()=>{
        consentRow.classList.toggle("is-error",!consentInput.checked);
      });
    }

    quizSubmit.addEventListener("click",()=>{
      const name=(nameInput?.value || "").trim();
      const phone=(phoneInput?.value || "").trim();
      const date=(dateInput?.value || "").trim();

      let valid=true;
      [nameInput,phoneInput,dateInput].forEach(input=>{
        if(!input) return;
        const empty=!input.value.trim();
        input.classList.toggle("is-error",empty);
        if(empty) valid=false;
      });

      const consentValid=Boolean(consentInput?.checked);
      if(consentRow) consentRow.classList.toggle("is-error",!consentValid);
      if(!consentValid) valid=false;

      if(!valid){
        const firstError=quizResultForm.querySelector(".quiz-input.is-error");
        if(firstError){
          firstError.focus();
        }else if(consentInput && !consentValid){
          consentInput.focus();
        }
        return;
      }

      const message=[
        "Здравствуйте, Максим! Я прошёл(а) расчёт на сайте.",
        "",
        `Подарок: ${quizAnswers[1] || "—"}`,
        `Мероприятие: ${quizAnswers[2] || "—"}`,
        `Количество гостей: ${quizAnswers[3] || "—"}`,
        `Нужна помощь: ${quizAnswers[4] || "—"}`,
        "",
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        `Дата мероприятия: ${date}`
      ].join("\n");

      const url=`https://wa.me/79779594171?text=${encodeURIComponent(message)}`;

      /* Do not transmit personal fields to analytics. */
      sendMetricaGoal("calculator_submit",{
        gift:quizAnswers[1] || "unknown",
        event_type:quizAnswers[2] || "unknown",
        guests:quizAnswers[3] || "unknown",
        help:quizAnswers[4] || "unknown"
      });
      sendMetricaGoal("whatsapp_click",{source:"calculator"});

      window.open(url,"_blank","noopener,noreferrer");
    });
  }

  /* ========================================================
     VISUAL UPGRADE V1 — About / Team / Portfolio
     One requestAnimationFrame loop, no layout mutation outside viewport.
     ======================================================== */
  const visualReduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const aboutSection=document.getElementById("about");

  const aboutPattern=document.querySelector(".about-pattern");

  /* =========================================================
     MOBILE ABOUT TICKER V31
     JS-driven so iPhone Safari cannot freeze/override it via legacy CSS.
     ========================================================= */
  if(aboutPattern && !visualReduceMotion){
    const mobileAboutTracks=[...aboutPattern.querySelectorAll(".about-pattern-track")];
    let mobileAboutVisible=true;
    let mobileAboutRaf=0;
    let mobileAboutStart=performance.now();
    let mobileAboutWidths=[];
    const measureAboutTracks=()=>{
      mobileAboutWidths=mobileAboutTracks.map(track=>track.querySelector(".about-pattern-copy")?.getBoundingClientRect().width || 0);
    };
    measureAboutTracks();
    window.addEventListener("resize",measureAboutTracks,{passive:true});
    document.fonts?.ready.then(measureAboutTracks);

    const renderMobileAboutTicker=now=>{
      mobileAboutRaf=0;
      if(!mobileAboutVisible || !phoneLite || document.hidden) return;

      const elapsed=(now-mobileAboutStart)/1000;

      mobileAboutTracks.forEach((track,index)=>{
        const firstCopy=track.querySelector(".about-pattern-copy");
        if(!firstCopy) return;

        /*
          Distance equals one repeated copy, so the loop is seamless.
          Every second line moves in the opposite direction.
        */
        const loopWidth=mobileAboutWidths[index];
        if(!loopWidth) return;

        const speed=26 + (index%4)*4; // px/sec, visible but not rushed
        const distance=(elapsed*speed)%loopWidth;
        const reverse=index%2===1;

        const x=reverse
          ? -loopWidth + distance
          : -distance;

        track.style.setProperty("transform",`translate3d(${x.toFixed(2)}px,0,0)`,"important");
        track.style.setProperty("-webkit-transform",`translate3d(${x.toFixed(2)}px,0,0)`,"important");
      });

      mobileAboutRaf=requestAnimationFrame(renderMobileAboutTicker);
    };

    const startMobileAboutTicker=()=>{
      if(mobileAboutRaf || !mobileAboutVisible || !phoneLite || document.hidden) return;
      mobileAboutRaf=requestAnimationFrame(renderMobileAboutTicker);
    };

    if("IntersectionObserver" in window){
      const mobileAboutObserver=new IntersectionObserver(entries=>{
        mobileAboutVisible=entries.some(entry=>entry.isIntersecting);
        if(mobileAboutVisible){
          startMobileAboutTicker();
        }else if(mobileAboutRaf){
          cancelAnimationFrame(mobileAboutRaf);
          mobileAboutRaf=0;
        }
      },{rootMargin:"120px 0px 120px 0px",threshold:0});
      mobileAboutObserver.observe(aboutPattern);
    }

    window.addEventListener("pageshow",()=>{
      mobileAboutStart=performance.now();
      mobileAboutVisible=true;
      startMobileAboutTicker();
    },{passive:true});

    phoneQuery.addEventListener("change",()=>{
      if(phoneLite) startMobileAboutTicker();
      else mobileAboutTracks.forEach(track=>{
        track.style.removeProperty("transform");
        track.style.removeProperty("-webkit-transform");
      });
    });
    document.addEventListener("visibilitychange",startMobileAboutTicker);
    startMobileAboutTicker();
  }

  const aboutPhoto=document.getElementById("aboutPhotoCard");
  const teamSection=document.getElementById("team");
  const teamRows=[...document.querySelectorAll(".team-bg-pattern > div")];
  const portfolioSection=document.getElementById("portfolio");
  const portfolioImages=[];
  const portfolioWord=document.querySelector(".portfolio-word");

  let visualTicking=false;

  function clamp01(value){
    return Math.max(0,Math.min(1,value));
  }

  function visualSectionProgress(element){
    if(!element) return 0;
    const rect=element.getBoundingClientRect();
    const vh=window.innerHeight || 1;
    return clamp01((vh-rect.top)/(vh+rect.height));
  }

  function visualIsNearViewport(element,margin=250){
    if(!element) return false;
    const rect=element.getBoundingClientRect();
    return rect.bottom>-margin && rect.top<(window.innerHeight+margin);
  }

  function updateVisualLayers(){
    visualTicking=false;
    if(visualReduceMotion) return;

    if(visualIsNearViewport(aboutSection,320)){
      const p=visualSectionProgress(aboutSection);
      const patternAmplitude=phoneLite ? 38 : 58;
      const photoAmplitude=phoneLite ? -22 : -34;

      if(aboutPattern){
        aboutPattern.style.setProperty("--about-pattern-y",`${(p-.5)*patternAmplitude}px`);
      }

      if(aboutPhoto){
        aboutPhoto.style.setProperty("--about-photo-y",`${(p-.5)*photoAmplitude}px`);
      }
    }

    /* Portfolio remains intentionally untouched on phone. */
    if(!phoneLite && visualIsNearViewport(portfolioSection,360)){
      const vh=window.innerHeight || 1;

      portfolioImages.forEach((img,index)=>{
        const holder=img.closest(".portfolio-img");
        if(!holder) return;

        const rect=holder.getBoundingClientRect();
        const center=rect.top+(rect.height/2);
        const normalized=(center-(vh/2))/(vh+rect.height);
        const direction=index%2===0 ? 1 : -1;
        const px=Math.max(-15,Math.min(15,normalized*30*direction));

        img.style.setProperty("--portfolio-parallax",`${px}px`);
      });
    }
  }


  function requestVisualUpdate(){
    if(phoneLite || visualTicking || visualReduceMotion) return;
    visualTicking=true;
    requestAnimationFrame(updateVisualLayers);
  }

  if(!visualReduceMotion){
    window.addEventListener("scroll",requestVisualUpdate,{passive:true});
    window.addEventListener("resize",requestVisualUpdate,{passive:true});
    window.addEventListener("load",requestVisualUpdate,{once:true});
    requestVisualUpdate();
  }else{
    if(aboutPattern) aboutPattern.style.setProperty("--about-pattern-y","0px");
    if(aboutPhoto) aboutPhoto.style.setProperty("--about-photo-y","0px");
  }

  if("IntersectionObserver" in window){
    const decorativeObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>entry.target.classList.toggle("motion-paused",!entry.isIntersecting));
    },{rootMargin:"100px"});
    document.querySelectorAll(".hero,.team-section,.portfolio-section,.contact-final").forEach(el=>decorativeObserver.observe(el));
  }

  /* Small 3D response only on desktop pointer devices. */
  if(
    aboutPhoto &&
    !visualReduceMotion &&
    window.matchMedia("(hover:hover) and (pointer:fine)").matches
  ){
    aboutPhoto.addEventListener("pointermove",event=>{
      const rect=aboutPhoto.getBoundingClientRect();
      const x=(event.clientX-rect.left)/rect.width-.5;
      const y=(event.clientY-rect.top)/rect.height-.5;

      aboutPhoto.style.setProperty("--about-tilt-y",`${x*2.4}deg`);
      aboutPhoto.style.setProperty("--about-tilt-x",`${y*-2.0}deg`);
    });

    aboutPhoto.addEventListener("pointerleave",()=>{
      aboutPhoto.style.setProperty("--about-tilt-y","0deg");
      aboutPhoto.style.setProperty("--about-tilt-x","0deg");
    });
  }


  /* ========================================================
     FAQ + CONTACT VISUAL V2
     ======================================================== */
  const faqSectionVisual=document.getElementById("faq");
  const contactSectionVisual=document.getElementById("contact");
  const contactPhoneWrap=document.getElementById("contactPhoneWrap");
  const contactTime=document.getElementById("contactPhoneTime");

  const fcClamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
  const fcEase=value=>value*value*(3-2*value);
  let fcRAF=0;

  function fcSectionProgress(element){
    if(!element) return 0;
    const rect=element.getBoundingClientRect();
    const vh=window.innerHeight || 1;
    const raw=(vh*.92-rect.top)/Math.max(1,rect.height+vh*.68);
    return fcEase(fcClamp(raw));
  }

  function fcRender(){
    fcRAF=0;

    if(faqSectionVisual){
      const faqP=fcSectionProgress(faqSectionVisual);
      faqSectionVisual.style.setProperty("--faq-scene-p",faqP.toFixed(4));
    }

    if(contactSectionVisual){
      const contactP=fcSectionProgress(contactSectionVisual);
      contactSectionVisual.style.setProperty("--contact-scene-p",contactP.toFixed(4));
      contactSectionVisual.style.setProperty(
        "--contact-wave-x",
        `${((contactP-.5)*-26).toFixed(2)}px`
      );
      contactSectionVisual.style.setProperty(
        "--contact-phone-y",
        `${((contactP-.5)*-13).toFixed(2)}px`
      );
    }
  }

  function requestFcRender(){
    if(phoneLite || fcRAF) return;
    fcRAF=requestAnimationFrame(fcRender);
  }

  window.addEventListener("scroll",requestFcRender,{passive:true});
  window.addEventListener("resize",requestFcRender,{passive:true});
  window.addEventListener("load",requestFcRender,{once:true});
  requestFcRender();

  /* Real local time inside the stylized phone. */
  function updateContactPhoneTime(){
    if(!contactTime) return;
    const now=new Date();
    contactTime.textContent=now.toLocaleTimeString("ru-RU",{
      hour:"2-digit",
      minute:"2-digit"
    });
  }

  updateContactPhoneTime();
  window.setInterval(updateContactPhoneTime,30000);

  /* Very small desktop pointer tilt — disabled on touch/reduced motion. */
  if(
    contactPhoneWrap &&
    window.matchMedia("(hover:hover) and (pointer:fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ){
    contactPhoneWrap.addEventListener("pointermove",event=>{
      const rect=contactPhoneWrap.getBoundingClientRect();
      const x=(event.clientX-rect.left)/rect.width-.5;
      const y=(event.clientY-rect.top)/rect.height-.5;

      contactPhoneWrap.style.setProperty("--contact-tilt-y",`${(x*2.2).toFixed(2)}deg`);
      contactPhoneWrap.style.setProperty("--contact-tilt-x",`${(y*-1.7).toFixed(2)}deg`);
    });

    contactPhoneWrap.addEventListener("pointerleave",()=>{
      contactPhoneWrap.style.setProperty("--contact-tilt-y","0deg");
      contactPhoneWrap.style.setProperty("--contact-tilt-x","0deg");
    });
  }


  /* ========================================================
     FLOW POLISH V1 — section transitions
     ======================================================== */
  const flowBridges=[...document.querySelectorAll(".flow-bridge")];
  let flowRAF=0;

  const flowClamp=value=>Math.max(0,Math.min(1,value));
  const flowEase=value=>value*value*(3-2*value);

  function renderFlowBridges(){
    flowRAF=0;
    const vh=window.innerHeight || 1;

    flowBridges.forEach(bridge=>{
      const rect=bridge.getBoundingClientRect();
      const raw=(vh*.94-rect.top)/(vh*.42);
      const p=flowEase(flowClamp(raw));
      bridge.style.setProperty("--bridge-p",p.toFixed(4),"important");
    });
  }

  function requestFlowBridges(){
    if(phoneLite || flowRAF) return;
    flowRAF=requestAnimationFrame(renderFlowBridges);
  }

  if(flowBridges.length){
    window.addEventListener("scroll",requestFlowBridges,{passive:true});
    window.addEventListener("resize",requestFlowBridges,{passive:true});
    window.addEventListener("load",requestFlowBridges,{once:true});
    requestFlowBridges();
  }


  /* ========================================================
     MOBILE PASS V1 — floating calculator context visibility
     ======================================================== */
  const mobileCalcButton=document.querySelector(".calc");
  const mobileCalcSections=[
    document.getElementById("about"),
    document.getElementById("calculator"),
    document.getElementById("benefits"),
    document.getElementById("contract"),
    document.getElementById("cost"),
    document.getElementById("faq"),
    document.getElementById("contact")
  ].filter(Boolean);

  if(mobileCalcButton && mobileCalcSections.length && "IntersectionObserver" in window){
    const activeCalcSections=new Set();

    const mobileCalcObserver=new IntersectionObserver(entries=>{
      if(!window.matchMedia("(max-width:1199px)").matches){
        mobileCalcButton.classList.remove("is-mobile-context-hidden");
        activeCalcSections.clear();
        return;
      }

      entries.forEach(entry=>{
        if(entry.isIntersecting && entry.intersectionRatio>.08){
          activeCalcSections.add(entry.target);
        }else{
          activeCalcSections.delete(entry.target);
        }
      });

      mobileCalcButton.classList.toggle(
        "is-mobile-context-hidden",
        activeCalcSections.size>0
      );
    },{
      threshold:[0,.08,.2]
    });

    mobileCalcSections.forEach(section=>mobileCalcObserver.observe(section));

    window.addEventListener("resize",()=>{
      if(!window.matchMedia("(max-width:1199px)").matches){
        activeCalcSections.clear();
        mobileCalcButton.classList.remove("is-mobile-context-hidden");
      }
    },{passive:true});
  }

})();

  /* ========================================================
     ENTRY CONSENT V1
     Shows on first visit. Consent is voluntary.
     ======================================================== */
  const entryConsent=document.getElementById("entryConsent");
  const entryConsentBackdrop=entryConsent?.querySelector(".entry-consent-backdrop");
  const entryConsentCard=entryConsent?.querySelector(".entry-consent-card");
  const entryConsentAccept=document.getElementById("entryConsentAccept");
  const entryConsentDecline=document.getElementById("entryConsentDecline");
  const entryConsentClose=document.getElementById("entryConsentClose");
  const ENTRY_CONSENT_KEY="eventmaks_cookie_notice_v6";

  function readEntryConsent(){
    try{
      return window.localStorage.getItem(ENTRY_CONSENT_KEY);
    }catch(error){
      return null;
    }
  }

  function writeEntryConsent(value){
    try{
      window.localStorage.setItem(ENTRY_CONSENT_KEY,value);
    }catch(error){}
  }

  function openEntryConsent(){
    if(!entryConsent) return;

    entryConsent.style.removeProperty("display");
    entryConsent.hidden=false;
    entryConsent.setAttribute("aria-hidden","false");

    /* Banner mode: do not lock the page scroll. */
    document.body.classList.remove("entry-consent-open");


  }

  function closeEntryConsent(){
    if(!entryConsent) return;

    /*
      Do not rely only on the HTML hidden attribute.
      A previous mobile rule used display:grid!important and could visually
      override the hidden state in Safari. Force the modal off-screen
      synchronously, then keep hidden as the semantic state.
    */
    entryConsent.hidden=true;
    entryConsent.setAttribute("aria-hidden","true");
    entryConsent.style.setProperty("display","none","important");

    document.body.classList.remove("entry-consent-open");
  }

  function syncQuizConsentFromEntry(forceAccepted=null){
    const quizConsent=document.getElementById("privacyConsent");
    const row=document.getElementById("quizConsentRow");
    if(!quizConsent) return;

    const accepted=forceAccepted===null
      ? readEntryConsent()==="accepted"
      : Boolean(forceAccepted);

    quizConsent.checked=accepted;
    if(row) row.classList.remove("is-error");
  }

  /* Yandex Metrica 112523982. Load only after analytics consent. */
  const EVENTMAKS_METRIKA_ID=112523982;

  window.eventmaksReachGoal=(target,params={})=>{
    if(readEntryConsent()!=="accepted") return false;
    if(typeof window.ym!=="function") return false;

    try{
      window.ym(EVENTMAKS_METRIKA_ID,"reachGoal",target,params);
      return true;
    }catch(error){
      return false;
    }
  };

  function loadYandexMetrika(){
    if(window.__eventmaksMetrikaLoaded) return;
    window.__eventmaksMetrikaLoaded=true;

    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for(let j=0;j<e.scripts.length;j+=1){
        if(e.scripts[j].src===r) return;
      }
      k=e.createElement(t);
      a=e.getElementsByTagName(t)[0];
      k.async=1;
      k.src=r;
      a.parentNode.insertBefore(k,a);
    })(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=112523982","ym");

    window.ym(EVENTMAKS_METRIKA_ID,"init",{
      ssr:true,
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true
    });
  }

  if(readEntryConsent()==="accepted") loadYandexMetrika();

  if(entryConsent){
    const stored=readEntryConsent();

    if(stored!=="accepted" && stored!=="declined"){
      window.setTimeout(openEntryConsent,260);
    }else{
      syncQuizConsentFromEntry();
    }

    let entryConsentActionLocked=false;

    const finishEntryConsent=accepted=>{
      if(entryConsentActionLocked) return;
      entryConsentActionLocked=true;

      writeEntryConsent(accepted ? "accepted" : "declined");
      syncQuizConsentFromEntry(accepted);
      if(accepted) loadYandexMetrika();
      closeEntryConsent();

      window.setTimeout(()=>{
        entryConsentActionLocked=false;
      },250);
    };

    /*
      iPhone Safari can occasionally swallow a synthetic click inside a
      scrollable fixed dialog. Bind both pointer/touch activation and click.
      The lock above prevents the same tap from firing twice.
    */
    const bindEntryAction=(element,handler)=>{
      if(!element) return;

      const activate=event=>{
        if(event){
          event.preventDefault();
          event.stopPropagation();
        }
        handler();
      };

      element.addEventListener("click",activate);

      if("PointerEvent" in window){
        element.addEventListener("pointerup",event=>{
          if(event.pointerType==="touch" || event.pointerType==="pen"){
            activate(event);
          }
        });
      }else{
        element.addEventListener("touchend",activate,{passive:false});
      }
    };

    /*
      Accept uses CLICK only. On iPhone Safari, closing a fixed banner on
      pointerup/touchend can let the following synthetic click hit a link
      underneath ("ghost click"). Keeping acceptance on the final click
      prevents any underlying link from opening.
    */
    if(entryConsentAccept){
      entryConsentAccept.addEventListener("click",event=>{
        event.preventDefault();
        event.stopPropagation();
        finishEntryConsent(true);
      });
    }

    bindEntryAction(entryConsentDecline,()=>finishEntryConsent(false));
    bindEntryAction(entryConsentClose,()=>finishEntryConsent(false));

    /*
      Tapping the dark backdrop is also a safe way to dismiss the voluntary
      consent window, so the user can never become trapped in the modal.
    */
    bindEntryAction(entryConsentBackdrop,()=>finishEntryConsent(false));

    if(entryConsentCard){
      entryConsentCard.addEventListener("pointerup",event=>event.stopPropagation());
      entryConsentCard.addEventListener("click",event=>event.stopPropagation());
    }

    entryConsent.addEventListener("keydown",event=>{
      if(event.key==="Escape"){
        finishEntryConsent(false);
      }
    });
  }
