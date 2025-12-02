import './App.css'

function App() {
  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Onno</h1>
        <p className="tagline">Real-Time Conversation Intelligence</p>
      </header>

      <main className="main">
        <section className="hero">
          <h2 className="hero-title">
            회의 중 실시간으로<br />
            질문·인사이트를 제안하는<br />
            <span className="highlight">AI 대화 파트너</span>
          </h2>
          <p className="hero-description">
            VC/투자심사, Accelerator 멘토링, Company Builder를 위한<br />
            During-the-fact 대화 인텔리전스 플랫폼
          </p>
        </section>

        <section className="features">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>실시간 질문 제안</h3>
            <p>회의 중 놓치기 쉬운 핵심 질문을 실시간으로 제안합니다</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>맥락 인사이트</h3>
            <p>과거 대화 기록과 벤치마크를 바탕으로 인사이트를 제공합니다</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>워크플로우 연결</h3>
            <p>Notion, Calendar, Slack 등과 자동 연동됩니다</p>
          </div>
        </section>

        <section className="cta">
          <h3>현재 개발 중입니다</h3>
          <p>Beta 테스터 모집 예정 · 2025 Q1 출시 목표</p>
          <div className="status">
            <span className="status-badge">🚧 In Development</span>
            <span className="version">v0.1.0-alpha</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built with ❤️ for VC, Accelerator, and Company Builders</p>
      </footer>
    </div>
  )
}

export default App
