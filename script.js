document.addEventListener('DOMContentLoaded', function() {
    const transcriptInput = document.getElementById('transcript');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const summaryOutput = document.getElementById('summary');
    const timestampsOutput = document.getElementById('timestamps');
    const copySummaryBtn = document.getElementById('copySummary');
    const copyTimestampsBtn = document.getElementById('copyTimestamps');

    summarizeBtn.addEventListener('click', async function() {
        const transcript = transcriptInput.value.trim();
        
        if (!transcript) {
            alert('Bitte fügen Sie ein Transcript ein.');
            return;
        }

        summarizeBtn.disabled = true;
        summarizeBtn.textContent = 'Verarbeitung...';

        try {
            const result = await processTranscript(transcript);
            summaryOutput.textContent = result.summary;
            timestampsOutput.textContent = result.timestamps;
            
            copySummaryBtn.disabled = false;
            copyTimestampsBtn.disabled = false;
        } catch (error) {
            alert('Fehler beim Verarbeiten des Transcripts: ' + error.message);
        } finally {
            summarizeBtn.disabled = false;
            summarizeBtn.textContent = 'Zusammenfassung erstellen';
        }
    });

    copySummaryBtn.addEventListener('click', function() {
        copyToClipboard(summaryOutput.textContent, 'Zusammenfassung kopiert!');
    });

    copyTimestampsBtn.addEventListener('click', function() {
        copyToClipboard(timestampsOutput.textContent, 'Zeitstempel kopiert!');
    });

    async function processTranscript(transcript) {
        const summary = await generateSummary(transcript);
        const timestamps = await formatTimestamps(transcript);
        
        return {
            summary: summary,
            timestamps: timestamps
        };
    }

    function extractTimestamps(transcript) {
        const timestampRegex = /(\d{1,2}:\d{2}(?::\d{2})?)/g;
        const lines = transcript.split('\n');
        const timestamps = [];

        lines.forEach(line => {
            const matches = line.match(timestampRegex);
            if (matches) {
                matches.forEach(timestamp => {
                    const content = line.replace(timestampRegex, '').trim();
                    if (content) {
                        timestamps.push({
                            time: timestamp,
                            content: content
                        });
                    }
                });
            }
        });

        return timestamps;
    }

    async function generateSummary(transcript) {
        const prompt = `Sie sind ein erfahrener Zusammenfasser von Videoinhalten. Ihre Aufgabe ist es, eine prägnante und ansprechende Zusammenfassung eines Loom-Video-Transkripts zu erstellen. Das Transkript finden Sie hier:

<loom_transkript>
${transcript}
</loom_transkript>

Bitte erstellen Sie eine Zusammenfassung, die den Kern des Videoinhalts erfasst und sich für die direkte Einfügung in circle.so eignet. Befolgen Sie dabei diese Richtlinien:

1. Sprechen Sie den Teilnehmer direkt an und verwenden Sie einen freundlichen und persönlichen Ton.
2. Begrenzen Sie die Zusammenfassung auf maximal 100 Wörter.
3. Konzentrieren Sie sich auf die wichtigsten Punkte, die Haupterkenntnisse und alle umsetzbaren Ratschläge aus dem Video.
4. Stellen Sie sicher, dass die Zusammenfassung gut formatiert und leicht zu lesen ist.
5. Fügen Sie gegebenenfalls wichtige nächste Schritte oder Handlungsaufforderungen ein, die im Video erwähnt werden.

Bevor Sie die endgültige Zusammenfassung schreiben, führen Sie bitte folgende Schritte in einem <analysis>-Block durch:

1. Identifizieren und listen Sie die Hauptthemen oder Kernpunkte aus dem Transkript auf.
2. Notieren Sie alle umsetzbaren Ratschläge oder nächsten Schritte, die im Video erwähnt werden.
3. Formulieren Sie einige potenzielle Eröffnungssätze, die den Teilnehmer direkt ansprechen.

Stellen Sie sich beim Verfassen Ihrer Zusammenfassung vor, dass Sie direkt mit dem Kursteilnehmer sprechen und ihm helfen, die Hauptideen des Videos schnell zu erfassen, ohne es erneut ansehen zu müssen.

Bitte geben Sie Ihre endgültige Zusammenfassung innerhalb von <summary>-Tags an. Ihre Ausgabe sollte nur aus der Zusammenfassung bestehen, ohne zusätzliche Kommentare oder Erklärungen und ohne die Arbeit aus dem Analyseblock zu wiederholen.

Denken Sie daran: Die gesamte Zusammenfassung muss auf Deutsch verfasst sein.`;

        try {
            // API-Aufruf über lokalen Server
            const response = await fetch('/api/claude', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            if (!response.ok) {
                throw new Error('Server-Aufruf fehlgeschlagen');
            }

            const data = await response.json();
            const summary = data.content[0].text;
            
            // Extrahiere nur den Inhalt zwischen <summary> Tags
            const summaryMatch = summary.match(/<summary>(.*?)<\/summary>/s);
            return summaryMatch ? summaryMatch[1].trim() : summary;
            
        } catch (error) {
            console.error('Fehler bei Server-Aufruf:', error);
            return 'Fehler beim Generieren der Zusammenfassung.';
        }
    }

    async function formatTimestamps(transcript) {
        const prompt = `Sie sind ein erfahrener Assistent, der Zoom-Meeting-Transkripte analysiert und zusammenfasst. Ihre Aufgabe ist es, die wichtigsten Themen aus einem Transkript zu extrahieren und eine prägnante Zusammenfassung mit Zeitstempeln zu erstellen. Diese Zusammenfassung soll einen Überblick über die Hauptpunkte des Meetings geben.

Hier ist das Zoom-Meeting-Transkript, das Sie analysieren sollen:

<zoom_transkript>
${transcript}
</zoom_transkript>

Bitte befolgen Sie diese Anweisungen:

1. Lesen Sie das Transkript sorgfältig durch.
2. Identifizieren Sie die wichtigsten im Meeting besprochenen Themen.
3. Wählen Sie maximal 7 Schlüsselthemen oder bedeutende Momente aus.
4. Erstellen Sie für jedes ausgewählte Thema einen Zeitstempel und eine kurze Beschreibung von maximal 7 Wörtern.
5. Ordnen Sie die Zeitstempel chronologisch.
6. Achten Sie darauf, die Hauptthemen und wichtigsten Punkte der Diskussion zu erfassen.

Bevor Sie die endgültige Zusammenfassung erstellen, analysieren Sie bitte das Transkript in den folgenden <themenanalyse> Tags:

- Listen Sie alle potenziellen Schlüsselthemen mit ihren entsprechenden Zeitstempeln auf
- Bewerten Sie die Wichtigkeit jedes Themas und erklären Sie, warum es einbezogen oder ausgeschlossen werden sollte
- Zählen Sie die Anzahl der ausgewählten Themen, um sicherzustellen, dass sie 7 nicht überschreitet
- Achten Sie darauf, dass jede Themenbeschreibung 7 Wörter oder weniger enthält

Nach Ihrer Analyse erstellen Sie bitte die Zusammenfassung im folgenden Format:

<zusammenfassung>
[HH:MM:SS] Kurze Beschreibung des Themas (max. 7 Wörter)
[HH:MM:SS] Kurze Beschreibung des Themas (max. 7 Wörter)
[HH:MM:SS] Kurze Beschreibung des Themas (max. 7 Wörter)
...
</zusammenfassung>

Wichtig: Alle Ausgaben, einschließlich der Analyse und der Zusammenfassung, müssen auf Deutsch sein.

Ihre endgültige Ausgabe sollte nur aus dem <zusammenfassung> Abschnitt mit den Zeitstempeln und kurzen Beschreibungen bestehen. Fügen Sie keine zusätzlichen Erklärungen oder Notizen außerhalb der Zusammenfassungs-Tags hinzu.`;

        try {
            // API-Aufruf über lokalen Server
            const response = await fetch('/api/claude', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            if (!response.ok) {
                throw new Error('Server-Aufruf fehlgeschlagen');
            }

            const data = await response.json();
            const timestamps = data.content[0].text;
            
            // Extrahiere nur den Inhalt zwischen <zusammenfassung> Tags
            const timestampMatch = timestamps.match(/<zusammenfassung>(.*?)<\/zusammenfassung>/s);
            return timestampMatch ? timestampMatch[1].trim() : timestamps;
            
        } catch (error) {
            console.error('Fehler bei Zeitstempel-Server-Aufruf:', error);
            return 'Fehler beim Generieren der Zeitstempel.';
        }
    }

    function copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text).then(function() {
            const originalText = event.target.textContent;
            event.target.textContent = successMessage;
            setTimeout(() => {
                event.target.textContent = originalText;
            }, 2000);
        }).catch(function(err) {
            console.error('Fehler beim Kopieren: ', err);
            alert('Kopieren fehlgeschlagen. Bitte manuell markieren und kopieren.');
        });
    }
});