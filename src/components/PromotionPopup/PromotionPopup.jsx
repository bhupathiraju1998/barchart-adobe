import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import "./PromotionPopup.css";

const defaultColors = {
  bodyBgColor: "#021a28",
  bodyBgImage: "none",
  bodyBorder: "2px solid #ffd700",
  bodyGlow: "inset 0 0 80px rgba(0,0,0,0.8)",
  goldGradient: "linear-gradient(to bottom, #ffe600 0%, #ffcc00 50%, #ffaa00 100%)",
  primaryBtnBg: "linear-gradient(to bottom, #ff6a00 0%, #ee0909 100%)",
  secondaryBtnBg: "linear-gradient(to bottom, #ffd700 0%, #ffb700 100%)",
  overlayBg: "rgba(0, 0, 0, 0.6)",
  cardBg: "#fff",
  textColorPrimary: "#fff",
  textColorSub: "#ffe600",
};

const PromotionPopup = ({ template, onClose, useModalFrame = true }) => {
  const { content = {}, style = {} } = template || {};
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const confettiFrameRef = useRef(null);
  const bodyRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const [bodyScale, setBodyScale] = useState(1);
  const scaleRef = useRef(1);

  const styleVars = useMemo(() => {
    const colors = { ...defaultColors, ...(style.colors || {}) };
    const layout = style.layout || {};
    return {
      "--promo-overlay-bg": colors.overlayBg,
      "--promo-body-bg": colors.bodyBgColor,
      "--promo-body-image": colors.bodyBgImage,
      "--promo-body-border": colors.bodyBorder,
      "--promo-body-glow": colors.bodyGlow,
      "--promo-gold-gradient": colors.goldGradient,
      "--promo-primary-btn": colors.primaryBtnBg,
      "--promo-secondary-btn": colors.secondaryBtnBg,
      "--promo-text-primary": colors.textColorPrimary,
      "--promo-text-sub": colors.textColorSub,
      "--promo-body-margin": layout.bodyMargin || "0px 20px 20px 20px",
    };
  }, [style]);

  const computeSeconds = () => {
    const timerConfig = content.timer;
    if (!timerConfig) {
      return 0;
    }
    if (timerConfig.mode === "date" && timerConfig.endDate) {
      const target = new Date(timerConfig.endDate).getTime();
      return Math.max(0, Math.floor((target - Date.now()) / 1000));
    }
    const hours = timerConfig.startHours || 0;
    const mins = timerConfig.startMins || 0;
    const secs = timerConfig.startSecs || 0;
    return Math.max(0, hours * 3600 + mins * 60 + secs);
  };

  useEffect(() => {
    let seconds = computeSeconds();
    const update = () => {
      const days = Math.floor(seconds / (3600 * 24));
      let remainder = seconds - days * 3600 * 24;
      const hours = Math.floor(remainder / 3600);
      remainder -= hours * 3600;
      const minutes = Math.floor(remainder / 60);
      const secs = remainder - minutes * 60;

      setRemaining({ days, hours, minutes, seconds: secs });

      if (seconds > 0) {
        seconds -= 1;
      }
    };
    update();
    timerRef.current = setInterval(update, 1000);
    return () => {
      clearInterval(timerRef.current);
    };
  }, [content.timer]);

  useEffect(() => {
    if (!style?.confetti?.enabled) {
      return undefined;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }
    const ctx = canvas.getContext("2d");
    const particles = [];

    class ConfettiParticle {
      constructor(x, y, angleDeg, velocity) {
        const colors = style.confetti.colors || ["#ffd700", "#ff0000", "#ffffff"];
        this.colors = colors;
        const angleRad = (angleDeg * Math.PI) / 180;
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angleRad) * velocity;
        this.vy = Math.sin(angleRad) * velocity;
        this.size = Math.random() * 6 + 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.gravity = 0.25;
        this.drag = 0.98;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
      }
      update() {
        this.vy += this.gravity;
        this.vx *= this.drag;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
      isDead() {
        return (
          this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20
        );
      }
    }

    let frames = 0;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frames < 50) {
        for (let i = 0; i < 3; i += 1) {
          const velocityLeft = Math.random() * 12 + 10;
          const angleLeft = -45 - Math.random() * 45;
          particles.push(new ConfettiParticle(0, canvas.height, angleLeft, velocityLeft));
          const velocityRight = Math.random() * 12 + 10;
          const angleRight = -135 + Math.random() * 45;
          particles.push(
            new ConfettiParticle(
              canvas.width,
              canvas.height,
              angleRight,
              velocityRight
            )
          );
        }
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].isDead()) {
          particles.splice(i, 1);
        }
      }

      frames += 1;
      if (particles.length > 0 || frames < 50) {
        confettiFrameRef.current = requestAnimationFrame(loop);
      }
    };

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    confettiFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(confettiFrameRef.current);
    };
  }, [style]);

  useLayoutEffect(() => {
    const updateScale = () => {
      if (!bodyRef.current) {
        return;
      }
      const rect = bodyRef.current.getBoundingClientRect();
      const baseHeight = rect.height / scaleRef.current;
      const baseWidth = rect.width / scaleRef.current;
      const availableHeight = window.innerHeight - (useModalFrame ? 80 : 32);
      const availableWidth = window.innerWidth - 32;
      let nextScale = Math.min(
        1,
        availableHeight / baseHeight,
        availableWidth / baseWidth
      );
      if (!Number.isFinite(nextScale) || nextScale <= 0) {
        nextScale = 1;
      }
      if (Math.abs(nextScale - scaleRef.current) > 0.02) {
        scaleRef.current = nextScale;
        setBodyScale(nextScale);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, [content, style, useModalFrame]);

  const closePopup = () => {
    if (!useModalFrame) {
      onClose?.();
      return;
    }
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 150);
  };

  const formatNumber = (value) => String(value).padStart(2, "0");

  const handleOverlayClick = (event) => {
    if (useModalFrame && event.target === event.currentTarget) {
      closePopup();
    }
  };

  const body = (
    <div
      className="promotion-popup-body"
      ref={bodyRef}
      style={{
        MozTransform: bodyScale === 1 ? undefined : `scale(${bodyScale})`,
        MozTransformOrigin: "top center"
      }}
    >
      <canvas className="promotion-popup-confetti" ref={canvasRef} />
      <div className="promotion-popup-floating" aria-hidden="true">
        {(content.floatingDecorations || []).map((item, index) => (
          <div
            key={`${item.positionClass || "float"}-${index}`}
            className={`promotion-popup-float ${item.positionClass || ""}`}
          >
            <img src={item.src} alt={item.alt || "decoration"} />
          </div>
        ))}
      </div>

      {content.header?.text && (
        <div className="promotion-popup-header-pill">
          {content.header.iconSvgPath && (
            <svg viewBox="0 0 24 24">
              <path d={content.header.iconSvgPath} />
            </svg>
          )}
          <span>{content.header.text}</span>
        </div>
      )}

      <div className="promotion-popup-headline-gold">{content.headlines?.line1 || ""}</div>
      <div className="promotion-popup-headline-white">{content.headlines?.line2 || ""}</div>
      <div className="promotion-popup-headline-sub">{content.headlines?.line3 || ""}</div>

      <div className="promotion-popup-timer-row">
        {content.timer?.label && (
          <span className="promotion-popup-timer-label">{content.timer.label}</span>
        )}
        {remaining.days > 0 && (
          <>
            <div className="promotion-popup-timer-box">{formatNumber(remaining.days)}</div>
            <span className="promotion-popup-timer-colon">:</span>
          </>
        )}
        <div className="promotion-popup-timer-box">{formatNumber(remaining.hours)}</div>
        <span className="promotion-popup-timer-colon">:</span>
        <div className="promotion-popup-timer-box">{formatNumber(remaining.minutes)}</div>
        <span className="promotion-popup-timer-colon">:</span>
        <div className="promotion-popup-timer-box">{formatNumber(remaining.seconds)}</div>
      </div>

      <div className="promotion-popup-button-container">
        <button
          className="promotion-popup-btn-primary"
          onClick={() => {
            if (content.buttons?.primary?.link) {
              window.open(content.buttons.primary.link, "_blank");
            }
          }}
        >
          <span>{content.buttons?.primary?.text || "Unlock Now"}</span>
          {content.buttons?.primary?.showLockIcon && content.buttons?.primary?.lockIconSvgPath && (
            <svg viewBox="0 0 24 24">
              <path d={content.buttons.primary.lockIconSvgPath} />
            </svg>
          )}
        </button>
        {content.buttons?.secondary?.visible && (
          <button
            className="promotion-popup-btn-secondary"
            onClick={() => {
              if (content.buttons?.secondary?.link) {
                window.open(content.buttons.secondary.link, "_blank");
              }
            }}
          >
            {content.buttons?.secondary?.text || "Learn More"}
          </button>
        )}
      </div>

      <div className="promotion-popup-badges">
        {(content.badges || []).map((badge, index) => (
          <div className="promotion-popup-badge" key={`${badge.title}-${index}`}>
            <svg viewBox="0 0 24 24">
              <path d={badge.svgPath} />
            </svg>
            <div>
              <span>{badge.title}</span>
              <small>{badge.subtitle}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!useModalFrame) {
    return (
      <div className="promotion-popup-embedded" style={styleVars}>
        {body}
      </div>
    );
  }

  return (
    <div
      className={`promotion-popup-overlay ${isClosing ? "promotion-popup-overlay--closing" : ""}`}
      style={styleVars}
      role="dialog"
      aria-modal="true"
      onMouseDown={handleOverlayClick}
    >
      <div className="promotion-popup-card">
        <button className="promotion-popup-close" onClick={closePopup} aria-label="Close promotion popup">
          ×
        </button>
        {body}
      </div>
    </div>
  );
};

export default PromotionPopup;



