//Responsável por armazenar os objetos dos livros retornados pela API do Google.
let livrosEncontrados = [];

/**
 * Função utilitária que limpa o texto da descrição dos livros.
 * Ela remove sequências de zeros estranhas e espaços duplicados usando Expressões Regulares (Regex).
 */
function limparDescricao(descricao) {

    if (!descricao) {
        //Não tendo descrição, retonra um texto padrão para não quebrar a tela.
        return "Descrição indisponível.";
    }

    return descricao
    .replace(/^\.?0+/, "") // Remove sequências de zeros no início.
    .trim(); //Remove espaços em branco no começo e final.
}

/** 
 * Função assíncrona que conecta com a Google Books API.
 * Faz a busca dos livros com base no gênero selecionado e sorteia um ponto de início para trazer resultados variados.
*/
async function buscarLivros(genero) {

    const inicio = Math.floor(Math.random() * 100);

    // URL da API.
    const url =
`https://www.googleapis.com/books/v1/volumes?q=subject:${genero}&startIndex=${inicio}&maxResults=20&key=${CONFIG.GOOGLE_BOOKS_KEY}`;
    
    try {

        const resposta = await fetch(url);

        // Verifica se a requisição foi bem sucedida.
        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status}`);
        }

        // Converte a resposta para JSON.
        const dados = await resposta.json();

        // Caso nenhum livro seja encontrado:
        if (!dados.items) {
            console.log("Nenhum livro encontrado.");
            return [];
        }

        // Vetor onde serão armazenados todos os livros
        const livros = [];

        // Percorre todos os livros encontrados
        for (const item of dados.items) {

            const info = item.volumeInfo;

            // Ignora livros classificados como conteúdo adulto.
            if (info.maturityRating === "MATURE") {
                continue;
            }

            let isbn = "Não informado";

            const titulo = info.title.toLowerCase().trim();

            //Livros banidos.
            if (titulo.includes("the plague of fantasies") || titulo.includes("observing the erotic imagination")) {
                continue;
            }

            if (info.industryIdentifiers) {

                const isbn13 = info.industryIdentifiers.find(
                    id => id.type === "ISBN_13"
                );

                const isbn10 = info.industryIdentifiers.find(
                    id => id.type === "ISBN_10"
                );

                isbn = isbn13?.identifier || isbn10?.identifier || "Não informado";
            }

            //Definindo a capa do livro:
            let capa;

            // Se o livro tiver um ISBN válido, busca a capa em alta resolução na API do Open Library
            if (isbn !== "Não informado") {
                //Uso da API open library para trazer capaz com melhor resolução.
                capa = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
            } else {
                // Caso contrário, usa os links de imagem fornecidos pelo próprio Google (na melhor qualidade disponível)
                capa = info.imageLinks?.large || info.imageLinks?.medium || info.imageLinks?.thumbnail;
            }

            //Criando o objeto livro:
            const livro = {

                titulo: info.title || "Título não informado",
                autor: info.authors?.join(", ") || "Autor desconhecido",
                descricao: limparDescricao(info.description),
                isbn: isbn,
                capa: capa,
                editora: info.publisher || "Editora não informada",
                publicado: info.publishedDate || "Data não informada",
                paginas: info.pageCount || "Não informado",
                categorias: info.categories?.join(", ") || "Categoria não informada",
                idioma: info.language || "Não informado"
            };

            // Adiciona o livro ao vetor
            livros.push(livro);
        }

        // Retorna o vetor
        return livros;

    } catch (erro) {

        console.error("Erro ao buscar livros:", erro);

        return [];
    }

}

/**
 * Função responsável por criar dinamicamente os cards de livros no HTML
 * mapeando os dados que estão guardados no vetor global.
 */
function renderizarLivros() {

    const listaLivros = document.querySelector("#listaLivros");

    // Limpa a lista antes de inserir novos livros
    listaLivros.innerHTML = "";

    // Mostra apenas os 8 primeiros livros
    livrosEncontrados.slice(0,8).forEach((livro, indice)=>{ 

        const card = document.createElement("div");

        // Aplica as classes do Bootstrap para organizar a grade (2 cards por linha no mobile, 4 no Pc)
        card.className = "col-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center"; 

        //Cada card sabe que livro representa.
        card.dataset.indice = indice;

        //Cada card necessita ter um click para exibir as informações finais do livro.
        card.onclick = async () => {

            // Desativa temporariamente os cliques no card para evitar que o usuário clique duas vezes enquanto o Gemini trabalha.
            card.style.pointerEvents = "none";

            if (!livro.analise) {
                await analisarLivro(livro);
            }

            card.style.pointerEvents = "auto";

            mostrarDetalhes(livro);
        };

        // Injeta a estrutura HTML do card com a imagem e textos do livro.
        // O "onerror" tem como função colocar uma imagem reserva caso a capa oficial falhe ao carregar ou o livro não tenha uma capa disponível.
        card.innerHTML = `
            <div class="card livro-card h-100">
                
                <img src="${livro.capa}" class="card-img-top" alt="${livro.titulo}" 
                onerror="this.src='https://placehold.co/300x450?text=Capa+Indisponível'">
                <div class="card-body">

                    <h5 class="card-title">
                        ${livro.titulo}
                    </h5>

                    <p class="card-text">
                        ${livro.autor}
                    </p>

                </div>
            </div>
        `;

        // Insere o card recém-criado dentro do container principal da tela
        listaLivros.appendChild(card);
    });
}

/**
 * Função que exibe a seção de detalhes do livro clicado,
 * preenchendo as informações técnicas do Google e a resposta em JSON do Gemini.
 */
function mostrarDetalhes(livro) {

    //Esconde o modal até o clique do usuário.
    document.querySelector("#detalhes").classList.remove("d-none");

    // Injeta os dados básicos do livro nos elementos HTML correspondente.
    document.querySelector("#detalheCapa").src = livro.capa;
    document.querySelector("#detalheTitulo").textContent = livro.titulo;
    document.querySelector("#detalheAutor").textContent = livro.autor;
    document.querySelector("#detalheEditora").textContent = livro.editora;
    document.querySelector("#detalhePaginas").textContent = livro.paginas;
    document.querySelector("#detalheCategoria").textContent = livro.categorias;

    // Se o objeto possuir a propriedade "analise" (gerada pela API do Gemini), preenche os dados dinâmicos.
    if (livro.analise) {

        document.querySelector("#detalheResumo").textContent = livro.analise.resumo;
        document.querySelector("#detalheLeitor").textContent = livro.analise.tipoLeitor;
        document.querySelector("#detalheDificuldade").textContent = livro.analise.dificuldade;
        document.querySelector("#detalheCuriosidade").textContent = livro.analise.curiosidade;

        const listaTemas = document.querySelector("#detalheTemas");

        listaTemas.innerHTML = "";

        // Remove bolinhas da lista e exibe em linha com espaçamento (Bootstrap)
        listaTemas.className = "list-unstyled d-flex flex-wrap gap-2";

        // Percorre o array de temas gerado pelo Gemini e cria uma etiqueta (badge) para cada um
        livro.analise.temas.forEach((tema) => {
            const li = document.createElement("li");
            // Adiciona as classes visuais de badge estilizada do Bootstrap
            li.className = "badge bg-secondary p-2 fs-6 fw-normal";
            li.textContent = tema;
            listaTemas.appendChild(li);
        })

    }
        document.querySelector("#detalhes").scrollIntoView({
        behavior:"smooth"
    });
}

/**
 * Função assíncrona que cria o prompt com os dados do livro,
 * faz a requisição para a API do Gemini e trata a string de retorno para transformá-la em objeto Javascript.
 */
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

        Retorne neste formato:

        {
        "resumo": "",
        "tipoLeitor": "",
        "dificuldade": "",
        "temas": [],
        "curiosidade": ""
        }
        `;

    // Dispara a chamada para a função global (localizada no gemini.js) passando o prompt montado.
    const resposta = await chamarGemini(prompt);

    // Se a chamada falhar ou voltar em branco, define um objeto de erro padrão para o app não travar.
    if (!resposta) {

        livro.analise = {

            resumo: "Não foi possível gerar a análise.",
            tipoLeitor: "Indisponível.",
            dificuldade: "Indisponível.",
            temas: [],
            curiosidade: "A API Gemini não respondeu."
        };

        return livro;
    }

    try {
        // Tenta converter a string de texto puro retornada pelo Gemini em um objeto Js.
        livro.analise = JSON.parse(resposta);
    } catch (erro) {
        console.error("Erro ao converter resposta do Gemini para JSON.", erro);
        
        livro.analise = {
            resumo: "Não foi possível gerar o resumo no momento.",
            tipoLeitor: "Indisponível.",
            dificuldade: "Indisponível.",
            temas: [],
            curiosidade: "Tente novamente em alguns instantes."
        };   
    }
    return livro;
}

/**
 * Função de inicialização do fluxo do app.
 * Ela coordena a busca de dados na Google Books API e dispara a renderização dos cards.
 */
async function iniciar(genero) {

    livrosEncontrados = await buscarLivros(genero);

    // Aguarda os livros vindos da API do Google Books e guarda no vetor global.
    if(livrosEncontrados.length === 0){
        return;
    }

    renderizarLivros();

    //Desce a tela após os livros serem renderizados.
    document.querySelector("#livros").scrollIntoView({
        behavior: "smooth"
    });
}

// Mapeia o botão de busca principal do HTML
const btnBuscar = document.querySelector("#btnBuscar");

btnBuscar.onclick = async () => {

    CONFIG.GOOGLE_BOOKS_KEY = document.querySelector("#googleKey").value.trim();
    CONFIG.GEMINI_KEY = document.querySelector("#geminiKey").value.trim();

    if (CONFIG.GOOGLE_BOOKS_KEY === "" || CONFIG.GEMINI_KEY === "") {
        alert("Informe as duas chaves da API.");
        return;
    }
    
    // pega o gênero
    const genero = document.querySelector("#genero").value;

    await iniciar(genero);
};

// Intercepta o clique no link "Detalhes" da Navbar.
const linkDetalhesNav = document.querySelector('a[href="#detalhes"]');

linkDetalhesNav.onclick = (evento) => {
    const secaoDetalhes = document.querySelector("#detalhes");
    
    // Se a seção ainda está escondida, significa que nenhum livro foi clicado.
    if (secaoDetalhes.classList.contains("d-none")) {
        evento.preventDefault(); // Impede o link de tentar rolar a tela para o nada.
        alert("Por favor, busque e clique em um livro primeiro para ver os detalhes!");
    }
};
