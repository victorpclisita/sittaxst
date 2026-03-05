// Configurações e elementos da DOM
document.addEventListener("DOMContentLoaded", () => {

    // Injetar Textos do Config
    document.title = `${config.appName} | ${config.heroTitle}`;
    document.getElementById("brand-logo").src = config.logoPath;
    document.getElementById("hero-title").innerHTML = config.heroTitle.replace("ICMS-ST e DIFAL", "<span class='highlight'>ICMS-ST e DIFAL</span>");
    document.getElementById("hero-subtitle").textContent = config.heroSubtitle;

    document.getElementById("btn-hero-cta").textContent = config.primaryCTA;

    document.getElementById("diag-title").textContent = config.diagTitle;
    document.getElementById("diag-subtitle").textContent = config.diagSubtitle;

    const finalCta = document.getElementById("btn-final-cta");
    finalCta.textContent = config.finalCTA;
    finalCta.href = config.demoLink;

    // Máscaras de input
    // Lógica do Wizard (Agregado Linear 5 Etapas)
    let view = "closed"; // "closed" | "quiz" | "leadForm" | "result"
    let currentStepIndex = 0;
    const stepsData = config.pilars;
    const totalSteps = 4;

    const wizardContainer = document.getElementById("wizard-steps-container");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const btnSubmit = document.getElementById("btn-submit");

    const progressFill = document.getElementById("progress-fill");
    const stepIndicator = document.getElementById("step-indicator");
    const form = document.getElementById("diagnostico-form");

    const stepNames = [
        "Processo de Apuração (35%)",
        "Rastreabilidade e Memória (35%)",
        "Controle e Exposição (30%)",
        "Resultado do diagnóstico"
    ];

    // IDs fixos de cada etapa na ordem exata da máquina de estados
    const stepIds = ['step-0', 'step-1', 'step-2', 'step-result'];

    // Construir DOM das Etapas
    stepsData.forEach((pilar, index) => {
        const stepDiv = document.createElement("div");
        stepDiv.className = "wizard-step";
        stepDiv.id = `step-${index}`;
        if (index !== 0) stepDiv.classList.add("hidden");

        const titleEl = document.createElement("h3");
        titleEl.className = "pilar-title";
        titleEl.innerHTML = `${pilar.name}`;
        stepDiv.appendChild(titleEl);

        const pilarQuestions = config.questions.filter(q => q.pilar === pilar.id);

        pilarQuestions.forEach((q) => {
            const qDiv = document.createElement("div");
            qDiv.className = "question-item";

            const qText = document.createElement("p");
            const globalIndex = config.questions.findIndex(globalQ => globalQ.id === q.id) + 1;
            qText.textContent = `${globalIndex}. ${q.text}`;
            qDiv.appendChild(qText);

            const optionsDiv = document.createElement("div");
            optionsDiv.className = "options-group";

            const options = q.options || [
                { label: "Sim", val: 10 },
                { label: "Parcial", val: 5 },
                { label: "Não", val: 0 }
            ];

            options.forEach((opt, oIndex) => {
                const radioId = `${q.id}_opt${oIndex}`;

                const input = document.createElement("input");
                input.type = "radio";
                input.name = q.id;
                input.id = radioId;
                input.value = opt.val;
                input.required = true;

                const label = document.createElement("label");
                label.htmlFor = radioId;
                label.textContent = opt.label;

                optionsDiv.appendChild(input);
                optionsDiv.appendChild(label);
            });

            qDiv.appendChild(optionsDiv);
            stepDiv.appendChild(qDiv);
        });

        wizardContainer.appendChild(stepDiv);
    });

    // Renderizar FAQ
    const faqContainer = document.getElementById("faq-container");
    config.faq.forEach(item => {
        const div = document.createElement("div");
        div.className = "faq-item";
        div.innerHTML = `<h4>${item.q}</h4><p>${item.a}</p>`;
        faqContainer.appendChild(div);
    });

    // Ações de Navegação Base
    const diagnosticoSection = document.getElementById("diagnostico");

    const startDiagnostic = () => {
        // EVENTO DE RASTREAMENTO: Início do Diagnóstico
        trackEvent('Diagnostico_Iniciado', { etapa: 1 });

        // Se já houver algo aberto ou preenchido, resetamos via reload para garantir estado limpo
        if (view !== "closed" || sessionStorage.getItem("sittax_view")) {
            sessionStorage.removeItem("sittax_answers");
            sessionStorage.removeItem("sittax_view");
            window.location.hash = "diagnostico";
            window.location.reload();
            return;
        }

        view = "quiz";
        currentStepIndex = 0;
        updateWizardUI();
        diagnosticoSection.scrollIntoView({ behavior: 'smooth' });
    };

    document.getElementById("btn-hero-cta").addEventListener("click", startDiagnostic);

    // Novo botão abaixo do FAQ
    const btnFaqCta = document.getElementById("btn-faq-cta");
    if (btnFaqCta) {
        btnFaqCta.addEventListener("click", startDiagnostic);
    }

    // Restaurar sessão em caso de reload esquisito
    // Restaurar sessão ou auto-start
    window.addEventListener("load", () => {
        const savedView = sessionStorage.getItem("sittax_view");

        // Se a URL contiver o hash, forcamos o inicio do quiz
        if (window.location.hash === "#diagnostico") {
            console.log("Auto-start detectado via hash");
            view = "quiz";
            currentStepIndex = 0;
            diagnosticoSection.classList.remove("hidden");
            updateWizardUI();

            // Scroll para a seção
            setTimeout(() => {
                const y = diagnosticoSection.getBoundingClientRect().top + window.scrollY - 50;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }, 100);
            return;
        }

        if (savedView === "result") {
            console.log("Fallback restaurado para exibir Resultado");
            view = "result";
            currentStepIndex = 4;
            diagnosticoSection.classList.remove("hidden");
            updateWizardUI();
        }
    });

    function updateWizardUI() {
        console.log("render state:", view, "| step:", currentStepIndex + 1);

        if (view === "closed") {
            diagnosticoSection.classList.add("hidden");
            return;
        } else {
            diagnosticoSection.classList.remove("hidden");
        }

        // Ocultar cabeçalho principal no resultado
        const mainHeader = diagnosticoSection.querySelector(".form-header");
        if (view === "result") {
            mainHeader.style.display = "none";
        } else {
            mainHeader.style.display = "block";
        }

        // Exibir apenas a etapa desejada pela ID explícita
        stepIds.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;

            let show = false;
            if (view === "quiz" && id === `step-${currentStepIndex}`) show = true;
            else if (view === "result" && id === "step-result") show = true;

            if (show) el.classList.remove("hidden");
            else el.classList.add("hidden");
        });

        // Atualizar Barra de Progresso e Texto
        if (view === "quiz") {
            const progressPercentage = ((currentStepIndex + 1) / 3) * 100;
            progressFill.style.width = `${progressPercentage}%`;
            stepIndicator.textContent = `Etapa ${currentStepIndex + 1} de 3: ${stepNames[currentStepIndex]}`;
        } else if (view === "result") {
            progressFill.style.width = `100%`;
            stepIndicator.textContent = `Aqui está o seu resultado e nossas recomendações para seu escritório contábil!`;
            stepIndicator.classList.add("result-header-text");
        }

        // Controle de Botões
        btnPrev.classList.add("hidden");
        btnNext.classList.add("hidden");

        if (view === "quiz") {
            if (currentStepIndex === 0) {
                btnNext.classList.remove("hidden");
                btnNext.textContent = "Próximo";
            } else if (currentStepIndex === 1) {
                btnPrev.classList.remove("hidden");
                btnNext.classList.remove("hidden");
                btnNext.textContent = "Próximo";
            } else if (currentStepIndex === 2) {
                btnPrev.classList.remove("hidden");
                btnNext.classList.remove("hidden");
                btnNext.textContent = "Ver resultado";
            }
        }

        validateCurrentStep();
    }

    function validateCurrentStep() {
        if (view === "result") {
            btnNext.disabled = false;
            return;
        }

        // Validação das Etapas 1, 2 e 3 (Perguntas)
        const currentPilarId = stepsData[currentStepIndex].id;
        const questionsInStep = config.questions.filter(q => q.pilar === currentPilarId);

        let answeredInStep = 0;
        questionsInStep.forEach(q => {
            if (form.querySelector(`input[name="${q.id}"]:checked`)) {
                answeredInStep++;
            }
        });

        const isComplete = answeredInStep === questionsInStep.length;

        btnNext.disabled = !isComplete;
    }

    form.addEventListener("change", validateCurrentStep);
    form.addEventListener("input", validateCurrentStep);

    btnNext.addEventListener("click", () => {
        if (view === "quiz") {
            if (currentStepIndex < 2) {
                currentStepIndex++;
            } else if (currentStepIndex === 2) {
                calculateAndShowResult();
                return;
            }
            updateWizardUI();

            // Scroll suave pro topo do container nas transições
            const y = diagnosticoSection.getBoundingClientRect().top + window.scrollY - 50;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    });

    btnPrev.addEventListener("click", () => {
        if (view === "quiz" && currentStepIndex > 0) {
            currentStepIndex--;
        }
        updateWizardUI();

        const y = diagnosticoSection.getBoundingClientRect().top + window.scrollY - 50;
        window.scrollTo({ top: y, behavior: 'smooth' });
    });



    // ----------------------------------------------------
    // Lógica Matemática e Submissão Final Direta
    // ----------------------------------------------------
    let finalScoreMemory = 0;
    let resultDataMemory = null;
    let weakestPilarIdMemory = null;
    let pilarDrawScoresMemory = [];

    function calculateAndShowResult() {
        // Continuar: Calcular e Guardar Matemática
        let pilarTotals = { p1: 0, p2: 0, p3: 0 };
        config.questions.forEach(q => {
            const selected = document.querySelector(`input[name="${q.id}"]:checked`);
            if (selected) pilarTotals[q.pilar] += parseInt(selected.value);
        });

        finalScoreMemory = 0;
        pilarDrawScoresMemory = [];
        let lowestPercentage = Number.MAX_VALUE;

        config.pilars.forEach(pilar => {
            const maxSomaPilar = 30;
            const somaObtida = pilarTotals[pilar.id];

            const scorePilar = (somaObtida / maxSomaPilar) * pilar.weight * 10;
            finalScoreMemory += scorePilar;

            const percentage = somaObtida / maxSomaPilar;
            if (percentage < lowestPercentage) {
                lowestPercentage = percentage;
                weakestPilarIdMemory = pilar.id;
            }
            pilarDrawScoresMemory.push(percentage * 10);
        });

        finalScoreMemory = parseFloat(finalScoreMemory.toFixed(1));

        resultDataMemory = config.results.riscoElevado;
        for (const key in config.results) {
            const range = config.results[key];
            if (finalScoreMemory >= range.min && finalScoreMemory <= range.max) {
                resultDataMemory = range;
                break;
            }
        }

        // EVENTOS DE RASTREAMENTO
        trackEvent('Diagnostico_Perguntas_Finalizadas', { data_preenchida: true });
        trackEvent('Resultado_Visualizado', { score: finalScoreMemory });

        // RENDERIZAR RESULTADO AGORA
        console.log("[RESULT] setting view to result");

        // Sessão de Fallback contra reload nativo
        sessionStorage.setItem("sittax_answers", JSON.stringify(pilarTotals));
        sessionStorage.setItem("sittax_view", "result");

        // Estado pseudo mestre alterado no escopo global
        view = "result";
        currentStepIndex = 3;

        console.log("after", view, currentStepIndex);

        updateWizardUI();

        renderResult(finalScoreMemory, resultDataMemory, weakestPilarIdMemory, pilarDrawScoresMemory);

        // Scroll suave
        const y = diagnosticoSection.getBoundingClientRect().top + window.scrollY - 50;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }


    // Render do Resultado Chart (Permanece igual)
    let radarChartInstance = null;

    function renderResult(score, data, weakestPilarId, pilarDrawScores) {
        document.getElementById("score-final").textContent = score.toFixed(1);
        const circle = document.getElementById("score-circle");
        circle.style.backgroundColor = data.color;
        circle.style.borderColor = data.color;
        circle.style.color = "#ffffff";

        const classification = document.getElementById("score-classification");
        classification.textContent = data.title;
        classification.style.color = data.color;

        document.getElementById("result-main-message").textContent = data.message;
        document.getElementById("result-weakest-message").textContent = config.weakestPilarMessages[weakestPilarId];

        // Renderizar Recomendação Condicional
        const recBox = document.getElementById("recommendation-box");
        const recText = document.getElementById("recommendation-text");

        const recommendation = (config.recommendations || []).find(r => score >= r.min && score <= r.max);

        if (recommendation) {
            recText.innerHTML = recommendation.text;
            recBox.classList.remove("hidden");
        } else {
            recBox.classList.add("hidden");
        }

        // Renderizar Ações para Evoluir
        const actionsCard = document.getElementById("actions-card");
        let actionsHtml = `<h4 class="actions-card-title">Ações para evoluir ainda hoje:</h4>`;
        let totalPotentialGain = 0;
        let hasAnyAction = false;

        config.pilars.forEach(pilar => {
            const maxSomaPilar = 30;
            const somaObtida = pilarDrawScores[config.pilars.indexOf(pilar)] * 3; // pilarDrawScores is percentage * 10, so max is 100
            // Oops, pilarDrawScores is percentage * 10. So max is 10.
            // Let's re-calculate more reliably:
            const percentage = pilarDrawScores[config.pilars.indexOf(pilar)] / 10;

            let level = "";
            if (percentage < 0.5) level = "low";
            else if (percentage <= 0.8) level = "intermediate";

            if (level && config.pillarActions[pilar.id]) {
                const actions = config.pillarActions[pilar.id][level];
                if (actions && actions.length > 0) {
                    hasAnyAction = true;
                    actionsHtml += `
                        <div class="pillar-recommendation">
                            <h5>${config.pillarActions[pilar.id].name}</h5>
                            ${actions.map(a => {
                        totalPotentialGain += a.gain;
                        return `<div class="action-item">
                                    <span>${a.text}</span>
                                    <span class="action-gain">+${a.gain} pts</span>
                                </div>`;
                    }).join('')}
                        </div>
                    `;
                }
            }
        });

        if (hasAnyAction) {
            actionsHtml += `
                <div class="potential-score-box">
                    Implementando estas melhorias, sua pontuação pode subir até <span>${totalPotentialGain.toFixed(1)} pontos</span>.
                </div>
            `;
            actionsCard.innerHTML = actionsHtml;
            actionsCard.classList.remove("hidden");
        } else {
            actionsCard.classList.add("hidden");
        }

        const ctx = document.getElementById('radarChart').getContext('2d');

        // Botão acima do radar
        const radarContainer = document.querySelector('.radar-container');
        let btnConheca = document.getElementById('btn-conheca-sittax');
        if (!btnConheca) {
            btnConheca = document.createElement('a');
            btnConheca.id = 'btn-conheca-sittax';
            btnConheca.href = config.demoLink;
            btnConheca.target = '_blank';
            btnConheca.textContent = 'Conheça agora o Sittax ST';
            btnConheca.style.cssText = 'display:block; background-color:#22c55e; color:#ffffff; font-weight:700; font-size:1rem; padding:14px 32px; border-radius:50px; text-decoration:none; margin: 32px auto; cursor:pointer; width:fit-content; transition: transform 0.2s ease, box-shadow 0.2s ease;';
            btnConheca.onmouseover = () => { btnConheca.style.transform = 'scale(1.07)'; btnConheca.style.boxShadow = '0 6px 20px rgba(34,197,94,0.4)'; };
            btnConheca.onmouseout = () => { btnConheca.style.transform = 'scale(1)'; btnConheca.style.boxShadow = 'none'; };
            radarContainer.parentNode.insertBefore(btnConheca, radarContainer);
        }

        if (radarChartInstance) radarChartInstance.destroy();

        radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: config.pilars.map(p => p.name),
                datasets: [{
                    label: 'Sua Maturidade (0-10)',
                    data: pilarDrawScores,
                    backgroundColor: 'rgba(240, 90, 40, 0.2)',
                    borderColor: '#F05A28',
                    pointBackgroundColor: '#F05A28',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#F05A28',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: '#e2e8f0' },
                        grid: { color: '#e2e8f0' },
                        pointLabels: {
                            font: { family: "'Inter', sans-serif", size: 12, weight: 'bold' },
                            color: '#1e293b'
                        },
                        ticks: { min: 0, max: 10, stepSize: 2, display: false }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // Função "Dummy" de Rastreamento (Pixel/GA4 Hook)
    function trackEvent(eventName, eventData) {
        console.log(`[Tracking Event] ${eventName}`, eventData);
        // Aqui deve ser inserido os scripts de fbq('track') ou gtag('event')
    }
});
