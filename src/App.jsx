import React, { useEffect } from 'react';
import './index.css';

function App() {
  useEffect(() => {
    // Dynamically load the Vanilla JS to ensure DOM is ready
    const script = document.createElement('script');
    script.src = '/js/main.js';
    script.async = true;
    script.onload = () => {
      if (window.initMarimba) {
        window.initMarimba();
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      // Clean up GSAP instances to avoid memory leaks or duplicate ScrollTriggers on HMR
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(t => t.kill());
      }
    };
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="loader" id="loader" aria-hidden="true">
          <div className="loader-inner">
              <div className="loader-logo">
                  <span style={{ fontSize: '24px', fontWeight: 'bold' }}>ammar.ali</span>
                  <div className="loader-logo-fill" aria-hidden="true">
                      <span className="loader-logo-fill-bar"></span>
                  </div>
              </div>
              <div className="loader-text">Digital developer</div>
          </div>
      </div>
      <div className="blinds-overlay" id="blinds-overlay"></div>
      <div className="scroll-top-wrapper">
          <header className="header">
              <div className="header-container">
                  <div className="brand" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      ammar.ali
                  </div>
                  <nav className="navigation">
                      <a href="#" className="nav-link nav-link--active">Home</a>
                      <a href="#work" className="nav-link">Work</a>
                      <a href="#process" className="nav-link">About</a>
                      <a href="#contact" className="nav-link">Contact</a>
                  </nav>
              </div>
          </header>

          <main id="main-content">
              <section className="hero" id="home">
                  <div className="header-center">
                      <span className="header-tag">Digital developer</span>
                      <span className="header-location">Based in Kerala, India</span>
                  </div>
                  
                  <div className="hero-background">
                      <div className="shape shape-astrix" id="shape-astrix">
                          <img src="/assets/texture-astrix.png" alt="" className="shape-img shape-astrix-texture" />
                      </div>
                      <div className="shape shape-circle-left" id="shape-circle-left">
                          <img src="/assets/shape-circle1.webp" alt="" className="shape-img" />
                          <span className="shape-label" style={{fontFamily: "'Playfair Display', serif"}}>Visual <br/> design</span>
                      </div>
                      <div className="shape shape-starburst" id="shape-starburst">
                          <img src="/assets/shape-star1.webp" alt="" className="shape-img" />
                      </div>
                      
                      <div className="shape shape-circle-right" id="shape-circle-right">
                          <img src="/assets/shape-circle2.webp" alt="" className="shape-img" />
                          <span className="shape-label" style={{fontFamily: "'Playfair Display', serif"}}>Interaction<br/>design</span>
                      </div>
                      <div className="shape shape-leaf" id="shape-leaf">
                          <img src="/assets/shape-leaf1.webp" alt="" className="shape-img" />
                      </div>
                      <div className="shape shape-geometric" id="shape-geometric">
                          <img src="/assets/shape-star-box1.webp" alt="" className="shape-img" />
                      </div>
                      <div className="shape shape-circle-bottom" id="shape-circle-bottom">
                          <img src="/assets/shape-circle3.webp" alt="" className="shape-img" />
                          <span className="shape-label" style={{fontFamily: "'Playfair Display', serif"}}>Vibe<br/>Coding</span>
                      </div>
                  </div>
                  <div className="expertise-ring" aria-hidden="true">
                      <div className="expertise-center-text" style={{fontFamily: "'Playfair Display', serif"}}>My design<br/>practice</div>
                  </div>
                  
                  <div className="hero-content">
                      <div className="hero-tag">
                          <span className="pill-button">Web design & development</span>
                      </div>
                      <h1 className="hero-headline">
                          I <a href="#about" className="hero-title-img" id="selfie"></a>create living, breathing<br/>
                          websites for brands <a href="#work" className="hero-title-img" id="website"></a>that want<br/> 
                          to be felt, not just seen.
                      </h1>
                  </div>
              </section>

              <section className="section" id="expertise">
                  <div className="section-content">
                      <video
                          className="expertise-mobile-video"
                          src="/assets/expertise-ring-mobile.mp4"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="none"
                          aria-hidden="true"
                      ></video>
                  </div>
              </section>

              <section className="section" id="work"> 
                  <div className="section-content">
                      <div className="work__laptop" aria-hidden="true">
                          <img className="work__laptop-frame" src="/assets/sequence/laptop-sequence-_00001.webp" alt="" />
                          <video className="work__laptop-video" preload="none" muted playsInline loop></video> 
                      </div>
                  </div>
                  <div className="work__cursor" aria-hidden="true">
                      <div className="work__cursor-circle">
                          <svg className="work__cursor-arrow" viewBox="0 0 45 27" aria-hidden="true" focusable="false">
                                   <path d="M43.6466 13.3979C32.8541 13.3979 25.712 9.10371 22.228 1.00019" stroke="#3A4A16" strokeWidth="2" strokeLinecap="round"/>
                                  <path d="M43.6466 13.398C32.8541 13.3979 25.712 17.6922 22.228 25.7957" stroke="#3A4A16" strokeWidth="2" strokeLinecap="round"/>
                                  <path d="M42.8208 13.398L1 13.3979" stroke="#3A4A16" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <div className="work__cursor-label">Flight99</div>
                      </div>
                  </div>
              </section>

              <section className="section process" id="process">
                  <div className="section-content process__content">
                      <h2 className="process__headline">Designing, building, and refining as one continuous process</h2>
                      <div className="process__stack">
                          <div className="process__disks">
                              {/* Disk 4 */}
                              <div className="process__disk" data-disk="4">
                                  <div className="process__disk-graphic" aria-hidden="true">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="454" height="109" viewBox="0 0 454 109" fill="none">
                                          <g>
                                              <g clipPath="url(#paint0_angular_133_45_clip_path_4)" data-figma-skip-parse="true">
                                                  <g transform="matrix(2.75002e-09 0.0544758 -0.246409 1.2416e-08 226.834 54.4758)">
                                                      <foreignObject x="-1018.36" y="-1018.36" width="2036.71" height="2036.71">
                                                          <div className="disk-gradient" xmlns="http://www.w3.org/1999/xhtml" style={{background:"conic-gradient(from 90deg,rgba(193, 228, 247, 1) 0deg,rgba(218, 198, 235, 1) 360deg)",height:"100%",width:"100%",opacity:1}}></div>
                                                      </foreignObject>
                                                  </g>
                                              </g>
                                              <ellipse cx="226.834" cy="54.4758" rx="226.834" ry="54.4758"/>
                                          </g>
                                          <defs>
                                              <clipPath id="paint0_angular_133_45_clip_path_4">
                                                  <ellipse cx="226.834" cy="54.4758" rx="226.834" ry="54.4758"/>
                                              </clipPath>
                                          </defs>
                                      </svg>
                                  </div>
                                  <div className="process__disk-label">
                                      <h3 className="process__disk-label-headline">Listen & define</h3>
                                      <p className="process__disk-label-text">Understanding your business, users, and real goals.</p>
                                  </div>
                              </div>
                              {/* Disk 3 */}
                              <div className="process__disk" data-disk="3">
                                  <div className="process__disk-graphic" aria-hidden="true">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="454" height="109" viewBox="0 0 454 109" fill="none">
                                          <g>
                                              <g clipPath="url(#paint0_angular_133_45_clip_path_3)" data-figma-skip-parse="true">
                                                  <g transform="matrix(2.75002e-09 0.0544758 -0.246409 1.2416e-08 226.834 54.4758)">
                                                      <foreignObject x="-1018.36" y="-1018.36" width="2036.71" height="2036.71">
                                                          <div className="disk-gradient" xmlns="http://www.w3.org/1999/xhtml" style={{background:"conic-gradient(from 0deg,rgba(147, 221, 137, 1) 0deg,rgba(252, 106, 0, 1) 360deg)",height:"100%",width:"100%",opacity:1}}></div>
                                                      </foreignObject>
                                                  </g>
                                              </g>
                                              <ellipse cx="226.834" cy="54.4758" rx="226.834" ry="54.4758"/>
                                          </g>
                                          <defs>
                                              <clipPath id="paint0_angular_133_45_clip_path_3">
                                                  <ellipse cx="226.834" cy="54.4758" rx="226.834" ry="54.4758"/>
                                              </clipPath>
                                          </defs>
                                      </svg>
                                  </div>
                                  <div className="process__disk-label">
                                      <h3 className="process__disk-label-headline">Strategy & plan</h3>
                                      <p className="process__disk-label-text">Turning insight into structure, flows, and priorities.</p>
                                  </div>
                              </div>
                              {/* Disk 2 */}
                              <div className="process__disk" data-disk="2">
                                  <div className="process__disk-graphic" aria-hidden="true">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="454" height="109" viewBox="0 0 454 109" fill="none">
                                          <g>
                                              <g clipPath="url(#paint0_angular_133_45_clip_path_2)" data-figma-skip-parse="true">
                                                  <g transform="matrix(2.75002e-09 0.0544758 -0.246409 1.2416e-08 226.834 54.4758)">
                                                      <foreignObject x="-1018.36" y="-1018.36" width="2036.71" height="2036.71">
                                                          <div className="disk-gradient" xmlns="http://www.w3.org/1999/xhtml" style={{background:"conic-gradient(from 180deg,rgba(218, 198, 235, 1) 0deg,rgba(147, 221, 137, 1) 360deg)",height:"100%",width:"100%",opacity:1}}></div>
                                                      </foreignObject>
                                                  </g>
                                              </g>
                                              <ellipse cx="226.834" cy="54.4758" rx="226.834" ry="54.4758"/>
                                          </g>
                                          <defs>
                                              <clipPath id="paint0_angular_133_45_clip_path_2">
                                                  <ellipse cx="226.834" cy="54.4758" rx="226.834" ry="54.4758"/>
                                              </clipPath>
                                          </defs>
                                      </svg>
                                  </div>
                                  <div className="process__disk-label">
                                      <h3 className="process__disk-label-headline">Design & refine</h3>
                                      <p className="process__disk-label-text">Visual language, UX, and iteration.</p>
                                  </div>
                              </div>
                              {/* Disk 1 */}
                              <div className="process__disk" data-disk="1">
                                  <div className="process__disk-graphic" aria-hidden="true">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="454" height="109" viewBox="0 0 454 109" fill="none">
                                          <g>
                                              <g clipPath="url(#paint0_angular_133_45_clip_path_1)" data-figma-skip-parse="true">
                                                  <g transform="matrix(2.75002e-09 0.0544758 -0.246409 1.2416e-08 226.834 54.4758)">
                                                      <foreignObject x="-1018.36" y="-1018.36" width="2036.71" height="2036.71">
                                                          <div className="disk-gradient" xmlns="http://www.w3.org/1999/xhtml" style={{background:"conic-gradient(from 90deg,rgba(244, 103, 50, 1) 0deg,rgba(218, 198, 235, 1) 360deg)",height:"100%",width:"100%",opacity:1}}></div>
                                                      </foreignObject>
                                                  </g>
                                              </g>
                                              <ellipse cx="226.834" cy="54.4758" rx="226.834" ry="54.4758"/>
                                          </g>
                                          <defs>
                                              <clipPath id="paint0_angular_133_45_clip_path_1">
                                                  <ellipse cx="226.834" cy="54.4758" rx="226.834" ry="54.4758"/>
                                              </clipPath>
                                          </defs>
                                      </svg>
                                  </div>
                                  <div className="process__disk-label">
                                      <h3 className="process__disk-label-headline">Build & test</h3>
                                      <p className="process__disk-label-text">React, Vite, and real-world use.</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>

              <section className="section" id="contact">
                  <div className="section-content">
                      <h2>Let's work together</h2>
                      <p>I'm always looking for new projects and collaborations. If you have a project in mind, or just want to say hello, please get in touch.</p>
                      <div className="contact__info">
                              <p>Ammar Ali</p>
                              <p><a href="mailto:itsmeammarali@gmail.com" style={{textDecoration:"none"}}>itsmeammarali@gmail.com</a></p>
                       </div>
                       <div className="contact__links">
                          <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                          <a href="#" target="_blank" rel="noopener noreferrer">Behance</a>
                       </div>
                          
                  </div>
              </section>
              <footer className="footer">
                  <p>© 2026 Ammar Ali. Developer</p>
              </footer>
          </main>
      </div>
    </>
  );
}

export default App;
