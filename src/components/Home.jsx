import React, { useEffect } from 'react';
import { Button } from 'antd';
import { DownloadOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './Home.css';

const Home = () => {
  useEffect(() => {
    console.log('Home component mounted');
    const titleElement = document.querySelector('.hero-title');
    if (titleElement) {
      titleElement.classList.add('animate-in');
    }
  }, []);

  const scrollToAbout = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };

  console.log('Rendering Home component');

  return (
      <section id="home" className="home-section">
        <div className="home-container">
          <div className="hero-content reveal">
            <div className="hero-intro">
              <span className="name">Hi! My name is João Vargas</span>
            </div>

            <h1 className="hero-title">
              <span className="title-line">Full-Stack</span>
              <span className="title-line">Developer</span>
            </h1>
            <div className="hero-actions">
              <Button
                  type="primary"
                  size="large"
                  icon={<DownloadOutlined />}
                  className="download-btn"
                  href="/assets/CurriculoVargas.pdf"
                  download="curriculo.pdf"
              >
                Download CV
              </Button>

              <Button
                  size="large"
                  icon={<ArrowRightOutlined />}
                  className="learn-more-btn"
                  onClick={scrollToAbout}
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-elements">
              <div className="floating-circle circle-1"></div>
              <div className="floating-circle circle-2"></div>
              <div className="floating-circle circle-3"></div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default Home;