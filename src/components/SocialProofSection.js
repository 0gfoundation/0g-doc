import React, { useEffect, useRef, useState } from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';

// Whole units shown with a "+" suffix, so a number is never overstated:
// 5,571,152 accounts renders as "5M+".
const wholeMillions = (n) => Math.max(1, Math.floor(n / 1e6));

// The values come from live-stats-plugin (fetched at build time, refreshed by
// the daily production redeploy). They are also the initial state so that the
// numbers are present in the server-rendered HTML: crawlers and other fetchers
// that do not run JavaScript used to read "0+ Partners". The count-up animation
// runs after hydration and counts up from 60% of the final value, so the numbers
// never drop to zero after the server-rendered values have been shown.
const SocialProofSection = () => {
  const stats = usePluginData('live-stats-plugin');
  const TARGETS = {
    partners: stats.partners,
    accounts: wholeMillions(stats.accounts),
    transactions: wholeMillions(stats.transactions),
  };
  const sectionRef = useRef(null);
  const timerRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(TARGETS);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasAnimatedRef.current) return;
          hasAnimatedRef.current = true;
          setIsVisible(true);
          if (!prefersReducedMotion) {
            animateCounts();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const animateCounts = () => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;

    // Count up from a fraction of the final value so the SSR numbers never
    // visibly drop to zero before the animation starts.
    const START = 0.6;
    setCounts({
      partners: Math.floor(TARGETS.partners * START),
      accounts: Math.floor(TARGETS.accounts * START),
      transactions: Math.floor(TARGETS.transactions * START),
    });

    timerRef.current = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      // Use different easing for smaller numbers to keep them moving
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      // For accounts (20), use more linear progression to avoid getting stuck
      const accountsProgress = progress < 0.7 ? progress / 0.7 : 1;

      const lerp = (target, t) => Math.floor(target * (START + (1 - START) * t));
      setCounts({
        partners: lerp(TARGETS.partners, easeOutQuart),
        accounts: lerp(TARGETS.accounts, accountsProgress * easeOutCubic),
        transactions: lerp(TARGETS.transactions, easeOutQuart),
      });

      if (currentStep >= steps) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setCounts(TARGETS);
      }
    }, interval);
  };

  return (
    <section className="social-proof-section" ref={sectionRef}>
      <div className="stats-container">
        <div className={`stat-item ${isVisible ? 'animate' : ''}`}>
          <div className="stat-number">
            <span className="count-up">{counts.partners}</span>+
          </div>
          <div className="stat-label">Partners</div>
        </div>
        <div className="stat-divider"></div>
        <div className={`stat-item ${isVisible ? 'animate' : ''}`}>
          <div className="stat-number">
            <span className="count-up">{counts.accounts}</span>M+
          </div>
          <div className="stat-label">Accounts</div>
        </div>
        <div className="stat-divider"></div>
        <div className={`stat-item ${isVisible ? 'animate' : ''}`}>
          <div className="stat-number">
            <span className="count-up">{counts.transactions}</span>M+
          </div>
          <div className="stat-label">Transactions</div>
        </div>
      </div>
      <div className="stats-updated">Network data as of {stats.fetchedAt}</div>
    </section>
  );
};

export default SocialProofSection;
