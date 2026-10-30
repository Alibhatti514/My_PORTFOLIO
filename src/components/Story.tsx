import { chapters } from '../data/chapters';
import { profile, projects } from '../data/portfolio';
import { socials } from '../data/socials';
import { ChapterButton, ResumeLink } from './AnimatedControls';

export function Arrow({down=false}:{down?:boolean}){return <span aria-hidden="true">{down?'↓':'↗'}</span>;}

interface StoryProps { active:number; go:(index:number)=>void; hover:(id:string|null)=>void; interact:(chapter:number)=>void }
export function Story({active,go,hover,interact}:StoryProps){
  return <main id="story" className="story" aria-label="Ali Bhatti’s portfolio story">
    {chapters.map((chapter,index)=><article key={chapter.id} data-chapter={index} tabIndex={-1} aria-hidden={index!==active} inert={index!==active} className={`chapter chapter--${chapter.id} ${active===index?'is-active':''}`} aria-labelledby={`title-${chapter.id}`}>
      {index===0?<>
        <div className="hero-eyebrow"><span className="tiny-cross">+</span> THE INTERNET, BUILT BY ME</div>
        <div className="hero-name"><span className="overline">THE PERSON BEHIND THE PIXELS</span><h1 id={`title-${chapter.id}`}>ALI<br/><span>BHATTI</span><span className="name-dot">.</span></h1><div className="name-rule"/><span className="hero-coordinate">INDEPENDENT DEVELOPER / PAKISTAN</span></div>
        <div className="hero-profession"><span className="overline"><i className="status-dot"/> IDEAS → EXPERIENCES</span><h2>FULL STACK<br/><span>WEB DEVELOPER</span></h2><p>I build the things<br/>you interact with.</p><button className="text-link" data-goto="7" onClick={()=>go(7)}>Explore my work <Arrow/></button></div>
        <div className="hero-bottom"><p>A human story.<br/><span>A digital world.</span></p><ChapterButton className="scroll-cue" iconFirst data-goto="1" aria-label="Scroll to the next chapter" onClick={()=>go(1)}>SCROLL TO ENTER<br/><small>THE STORY</small></ChapterButton><span className="hero-caption">DESIGNED WITH INTENTION.<br/>BUILT FROM THE FIRST LINE.</span></div>
      </>:<>
        <div className="chapter-heading"><span className="overline">{chapter.eyebrow}</span><h2 id={`title-${chapter.id}`}>{chapter.title.split('\n').map((line,i)=><span key={line} className={i?'muted-title':''}>{line}<br/></span>)}</h2></div>
        {index<12&&<div className="chapter-caption"><span className="caption-line"/><p>{chapter.description}</p>{index===10||index===11?<p className="caption-detail">{chapter.detail}</p>:null}</div>}
        {index<12&&<div className="chapter-aside"><span className="overline">{index>=7&&index<=9?'THE PROJECT':'IN THE ARCHITECTURE'}</span><div className="chapter-tags">{chapter.tags.map(tag=><span key={tag}>{tag}</span>)}</div>{index>=7&&index<=9&&<><button className="project-action" onClick={()=>interact(index)}>{['Trace the route','Turn the pavilion','Deal a card'][index-7]}<span aria-hidden="true">↻</span></button><span className="unavailable"><span/> Project link unavailable</span></>}</div>}
        {index===12&&<>
          <p className="connect-intro">Good things begin<br/>with a conversation.</p>
          <div className="social-installations" aria-label="Connect with Ali Bhatti">{socials.map(s=><a key={s.id} data-social={s.id} href={s.href} target="_blank" rel="noopener noreferrer" className="social-link" aria-label={`${s.label} profile (opens in a new tab)`} onMouseEnter={()=>hover(s.id)} onMouseLeave={()=>hover(null)} onFocus={()=>hover(s.id)} onBlur={()=>hover(null)}><img src={s.icon} alt=""/><span>{s.label}<Arrow/></span></a>)}</div>
          <div className="contact-bottom"><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}<Arrow/></a><div className="contact-meta"><a href={profile.phoneHref}>{profile.phone}</a><span>{profile.location}</span></div><ResumeLink className="resume-link"/></div>
        </>}
      </>}
    </article>)}
  </main>;
}

export function ReadingView({onReturn,fallback}:{onReturn:()=>void;fallback:boolean}){
  return <main className="reading-view" id="story"><div className="reading-intro"><span className="overline">ALI BHATTI / THE INTERNET, BUILT BY ME</span><h1>A human story.<br/><span>A digital world.</span></h1><p>{fallback?'The complete portfolio, in a lighter view.':'The complete story, at your own pace.'}</p><button className="text-link" onClick={onReturn}>Enter the 3D experience <Arrow/></button></div>
    <img className="reading-portrait" src="/assets/ali-bhatti-portrait.png" alt="Ali Bhatti, full stack web developer"/>
    {chapters.map((c,i)=><section key={c.id} id={`read-${c.id}`}><span className="overline">{c.eyebrow}</span><h2>{c.title.replace('\n',' ')}</h2><p>{c.description}</p><p>{c.detail}</p>{i>=7&&i<=9&&<><img className="reading-logo" src={projects[i-7].logo} alt={`${projects[i-7].name} original logo`}/><p className="unavailable">Project link unavailable</p></>}<ul>{c.tags.map(tag=><li key={tag}>{tag}</li>)}</ul></section>)}
    <div className="reading-contact"><div className="reading-socials">{socials.map(s=><a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer"><img src={s.icon} alt=""/>{s.label}<Arrow/></a>)}</div><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}<Arrow/></a><a href={profile.phoneHref}>{profile.phone}</a><p>{profile.location}</p><ResumeLink className="resume-link"/></div>
  </main>;
}
