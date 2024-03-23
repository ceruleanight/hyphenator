function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

document.addEventListener("DOMContentLoaded", function(event) {
    document.getElementById('hyphenate').addEventListener('click', async function() {
        const inputText = document.getElementById('inputText').value.replace(/-/g, '=');
        const jsonFileURL = './words.json';

        try {
            const response = await fetch(jsonFileURL);

            if (!response.ok) {
                throw new Error('Failed to load JSON file');
            }

            const dict = await response.json();

            let outputText = inputText;

            for (const word in dict) {
                const regex = new RegExp('\\b' + word + '\\b', 'gi');

                outputText = outputText.replace(regex, match => {
                    return match[0] === match[0].toUpperCase() ? capitalize(dict[word]) : dict[word];
                });
            }

            document.getElementById('outputText').value = outputText;

            if (document.getElementById('copyToClipboard').checked) {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(outputText);
                } else {
                    document.getElementById('outputText').select();
                    document.execCommand('copy');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('outputText').value = 'An error occurred. Please check the console for details.';
        }
    });
});