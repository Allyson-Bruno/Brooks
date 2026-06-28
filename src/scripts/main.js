// Função responsável por buscar livros na Google Books API


// Remove caracteres indesejados das descrições
function limparDescricao(descricao) {

    if (!descricao) {
        return "Descrição indisponível.";
    }

    return descricao

    // Remove sequências de zeros no início
    .replace(/^\.?0+/, "")

    // Remove espaços repetidos
    .replace(/\s+/g, " ")

    // Remove espaços no começo e no final
    .trim();
}

async function buscarLivros() {

    //Será alterado.
    const GENERO = "fantasy";

    // URL da API
    const url =`https://www.googleapis.com/books/v1/volumes?q=subject:${GENERO}&maxResults=10&key=${CONFIG.GOOGLE_BOOKS_KEY}`;

    try {

        // Faz a requisição
        const resposta = await fetch(url);

        // Verifica se a requisição foi bem sucedida
        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status}`);
        }

        // Converte a resposta para JSON
        const dados = await resposta.json();

        // Caso nenhum livro seja encontrado
        if (!dados.items) {
            console.log("Nenhum livro encontrado.");
            return [];
        }

        // Vetor onde serão armazenados todos os livros
        const livros = [];

        // Percorre todos os livros encontrados
        for (const item of dados.items) {

            const info = item.volumeInfo;

            // ISBN
            let isbn = "Não informado";

            if (info.industryIdentifiers) {

                const isbn13 = info.industryIdentifiers.find(
                    id => id.type === "ISBN_13"
                );

                const isbn10 = info.industryIdentifiers.find(
                    id => id.type === "ISBN_10"
                );

                isbn = isbn13?.identifier || isbn10?.identifier || "Não informado";
            }

            // Objeto que representa um livro
            const livro = {

                titulo: info.title || "Título não informado",

                autor: info.authors?.join(", ") || "Autor desconhecido",

                descricao: limparDescricao(info.description),

                isbn: isbn,

                capa: info.imageLinks?.thumbnail || "./src/assets/imagens/sem-capa.png",

                editora: info.publisher || "Editora não informada",

                publicado: info.publishedDate || "Data não informada",

                paginas: info.pageCount || "Não informado",

                categorias: info.categories?.join(", ") || "Categoria não informada",

                idioma: info.language || "Não informado"

            };

            // Adiciona o livro ao vetor
            livros.push(livro);
        }

        // Mostra todos os livros no console
        console.log(livros);

        // Retorna o vetor
        return livros;

    } catch (erro) {

        console.error("Erro ao buscar livros:", erro);

        return [];

    }

}

    async function analisarLivro(livro) {

    const prompt = `
       
        Você é um assistente especializado em literatura.
        
        Todas as respostas devem ser em português do Brasil.

        Analise o seguinte livro.

        Título: ${livro.titulo}

        Autor: ${livro.autor}

        Editora: ${livro.editora}

        Ano de publicação: ${livro.publicado}

        Número de páginas: ${livro.paginas}

        Categoria: ${livro.categorias}

        Idioma: ${livro.idioma}

        Descrição:
        ${livro.descricao}

        Com base nessas informações, responda APENAS um JSON válido.

        Não utilize markdown.
        Não utilize \`\`\`json.
        Não escreva nenhuma explicação.

        Retorne exatamente neste formato:

        {
        "resumo": "",
        "tipoLeitor": "",
        "dificuldade": "",
        "temas": [],
        "curiosidade": ""
        }
        `;

    const resposta = await chamarGemini(prompt);

    try {

        livro.analise = JSON.parse(resposta);

    } catch (erro) {

        console.error("Erro ao converter resposta do Gemini para JSON.", erro);

        livro.analise = null;

    }

    return livro;

}

// Teste da função
async function iniciar() {

    const livros = await buscarLivros();

    if (livros.length === 0) {
        return;
    }

    const livroCompleto = await analisarLivro(livros[1]);

    console.log(livroCompleto);
}

iniciar();