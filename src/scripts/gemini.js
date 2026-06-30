const MODELO = "gemini-2.5-flash";

const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`;

async function chamarGemini(prompt) {

const corpoRequisicao = {

contents: [{

parts: [{text: prompt }]

}]

};

try {

const response = await fetch(URL, {

method: "POST",

headers: {

"Content-Type": "application/json",

"x-goog-api-key": CONFIG.GEMINI_KEY

},

body: JSON.stringify(corpoRequisicao)

});

if (!response.ok) {

throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);

}

const dados = await response.json();

return dados.candidates[0].content.parts[0].text;

} catch (erro) {

console.error("Algo deu errado na requisição:", erro);

return null;

}

};
