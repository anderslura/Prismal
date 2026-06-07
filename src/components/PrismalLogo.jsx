export default function PrismalLogo() {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10}}>
      <svg width="26" height="36" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
        <polygon points="32,16 54,16 26,144 4,144"   fill="#a8caff"/>
        <polygon points="64,16 86,16 58,144 36,144"  fill="#6699ff"/>
        <polygon points="96,16 118,16 90,144 68,144" fill="#3366ee"/>
      </svg>
      <div style={{display:'flex', flexDirection:'column', gap:2}}>
        <span style={{fontWeight:800, fontSize:19, color:'#ffffff', letterSpacing:1.5, lineHeight:1, fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'}}>PRISMAL</span>
        <div style={{display:'flex', alignItems:'center', gap:3}}>
          <span style={{fontSize:10, fontWeight:600, color:'#a8caff', letterSpacing:0.2}}>Din mal.</span>
          <span style={{fontSize:10, color:'#4a5568'}}>·</span>
          <span style={{fontSize:10, fontWeight:600, color:'#6699ff', letterSpacing:0.2}}>Din pris.</span>
          <span style={{fontSize:10, color:'#4a5568'}}>·</span>
          <span style={{fontSize:10, fontWeight:600, color:'#7baeff', letterSpacing:0.2}}>Din tid.</span>
        </div>
      </div>
    </div>
  )
}
