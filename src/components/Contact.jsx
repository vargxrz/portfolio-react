import React from 'react';
import { Card, Button } from 'antd';
import { MailOutlined, GithubOutlined } from '@ant-design/icons';
import { MessageCircle, Heart, Coffee } from 'lucide-react';
import './Contact.css';
import {FaLinkedinIn} from "react-icons/fa";
import {MdEmail} from "react-icons/md";

const Contact = () => {
  const socialLinks = [
    {
      name: 'Email',
      icon: <MdEmail />,
      url: 'mailto:vargasvargasjoa@gmail.com',
      description: 'Send me an email!',
      username: 'vargasvargasjoa@gmail.com'
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedinIn />,
      url: 'https://www.linkedin.com/in/vargxrz/',
      description: 'Let\'s connect',
      username: '/in/vargxrz'
    },
    {
      name: 'GitHub',
      icon: <GithubOutlined />,
      url: 'https://github.com/vargxrz',
      description: 'Check my code',
      username: '/vargxrz'
    }
  ];

  return (
      <section id="contact" className="contact-section">
        <div className="contact-container">
          <div className="section-header reveal">
            <h2 className="section-title">
              Contact <span className="gradient-text">Me</span>
            </h2>
            <div className="title-underline"></div>
          </div>

          <div className="contact-content">
            <div className="contact-intro reveal">
              <Card className="intro-card">
                <div className="intro-content">
                  <div className="intro-icon">
                    <MessageCircle style={{ fontSize: '3rem', color: '#8b5cf6' }} />
                  </div>
                  <h3 className="intro-title">Let's talk!</h3>
                  <p className="intro-text">
                    I enjoy exploring new opportunities and projects.
                    If you'd like to work together or simply have a conversation, feel free to send me a message.
                  </p>
                  <div className="intro-stats">
                    <div className="stat">
                      <span className="stat-number">24h</span>
                      <span className="stat-label">Response Time</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">100%</span>
                      <span className="stat-label">Commitment</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="social-links reveal">
              {socialLinks.map((link, index) => (
                  <Card
                      key={link.name}
                      className="social-card"
                      style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Button
                        type="text"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-button"
                    >
                      <div className="social-content">
                        <div className="social-icon">
                          {link.icon}
                        </div>
                        <div className="social-info">
                          <div className="social-name">{link.name}</div>
                          <div className="social-description">{link.description}</div>
                          <div className="social-username">{link.username}</div>
                        </div>
                      </div>
                    </Button>
                  </Card>
              ))}
            </div>
          </div>

          <div className="contact-footer reveal">
            <div className="footer-content">
              <p className="footer-text">
                Build by João Vargas
              </p>
              <p className="footer-copyright">
                © 2025 All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </section>
  );
};

export default Contact;