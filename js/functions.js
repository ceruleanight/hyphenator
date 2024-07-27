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
			const lines = inputText.split('\n').map(line => line.trim()).join('\n');
			const words = lines.match(/[^\s]+|\s+/g);

			// loop through every word
			for (let i = 0; i < words.length; i++) {
				const word = words[i];

				if (/^\s+$/.test(word)) // ignore whitespace
					continue;

				let sanitizedWord = word.replace(/[^a-zA-Z'=]/g, ''); // remove non-letter characters except ' and =
				let isPlural = false;

				// check for plural words with "'s" at the end
				if (sanitizedWord.endsWith("'s")) {
					sanitizedWord = sanitizedWord.slice(0, -2);
					isPlural = true;
				}

				// split the word by equal signs to handle each part separately
				const parts = sanitizedWord.split('=');

				let transformedParts = parts.map(part => {
					let lowerCasePart = part.toLowerCase();
					let syllable = dict[lowerCasePart];

					if (syllable) {
						// overcomplicated code to preserve the case of each character in relation to equal signs
						let capitalizedSyllable = '';
						let originalIndex = 0;

						for (let j = 0; j < syllable.length; j++) {
							if (syllable[j] === '-') {
								capitalizedSyllable += '-';
							} else {
								if (part[originalIndex] && part[originalIndex] === part[originalIndex].toUpperCase()) {
									capitalizedSyllable += syllable[j].toUpperCase();
								} else {
									capitalizedSyllable += syllable[j].toLowerCase();
								}
								originalIndex++;
							}
						}

						return capitalizedSyllable;
					} else {
						return part; // if not found in dict, return the part as is
					}
				});

				let capitalizedSyllable = transformedParts.join('=');

				if (isPlural)
					capitalizedSyllable += "'s";

				// preserve original characters around the sanitized word
				const prefix = word.match(/^[^a-zA-Z'=]*/)[0]; // prefix non-alphabetic characters
				const suffix = word.match(/[^a-zA-Z'=]*$/)[0]; // suffix non-alphabetic characters
				words[i] = prefix + capitalizedSyllable + suffix;
			}

			const outputText = words.join('');


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