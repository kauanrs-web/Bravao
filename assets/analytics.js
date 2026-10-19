
    /* CONFIGURAÇÃO: substitua os IDs; não use dados pessoais ou segredos aqui.
       O domínio deve ser substituído também nas meta tags, JSON-LD e arquivos técnicos.
       whatsapp: DDI+DDD+número, só dígitos. Vazio mantém a demonstração segura. */
    // A configuração é lida de assets/config.js. Esta página mantém seu SEO próprio.
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('consent', 'default', {analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.bravoAnalyticsLoaded = false;
    /* GA4 (gtag.js) + Microsoft Clarity: carregados somente com consentimento e IDs reais. */
    window.startBravoAnalytics = function(){
      if(window.bravoAnalyticsLoaded) return;
      window.bravoAnalyticsLoaded = true;
      const cfg = window.BRAVO_CONFIG;
      gtag('consent','update',{analytics_storage:'granted'});
      if(/^G-[A-Z0-9]+$/.test(cfg.ga4) && cfg.ga4 !== 'G-XXXXXXXXXX'){
        const ga = document.createElement('script'); ga.async = true;
        ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4);
        document.head.appendChild(ga);
        gtag('js',new Date()); gtag('config',cfg.ga4,{allow_google_signals:false,allow_ad_personalization_signals:false});
      }
      if(/^[a-z0-9]+$/i.test(cfg.clarity) && cfg.clarity !== 'SEU_ID_CLARITY'){
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,'clarity','script',cfg.clarity);
        window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'granted'});
      }
    };
  