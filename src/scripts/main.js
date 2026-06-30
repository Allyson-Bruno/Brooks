let livrosEncontrados = [];
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

async function buscarLivros(genero) {

    const inicio = Math.floor(Math.random() * 100);

    // URL da API.
    const url =
`https://www.googleapis.com/books/v1/volumes?q=subject:${genero}&startIndex=${inicio}&maxResults=20&key=${CONFIG.GOOGLE_BOOKS_KEY}`;
    
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

            // Ignora livros classificados como conteúdo adulto.
            if (info.maturityRating === "MATURE") {
                continue;
            }

            // ISBN
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

            if (isbn !== "Não informado") {
                //Uso da API open library para trazer capaz com melhor resolução.
                capa = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
            } else {
                capa =
                info.imageLinks?.large ||
                info.imageLinks?.medium ||
                info.imageLinks?.thumbnail;
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

//Pega os livros buscados pela API e transforma eles em cards que apareceram na tela.
function renderizarLivros() {

    const listaLivros = document.querySelector("#listaLivros");

    // Limpa a lista antes de inserir novos livros
    listaLivros.innerHTML = "";

    // Mostra apenas os 8 primeiros livros
    livrosEncontrados.slice(0,8).forEach((livro, indice)=>{ 

        const card = document.createElement("div");

        card.className = "col-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center"; 

        //Cada card sabe que livro representa.
        card.dataset.indice = indice;

        //Cada card necessita ter um click para exibir as informações finais do livro.
        card.onclick = async () => {

            card.style.pointerEvents = "none";

            if (!livro.analise) {
                await analisarLivro(livro);
            }

            card.style.pointerEvents = "auto";

            mostrarDetalhes(livro);
        };

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

        listaLivros.appendChild(card);
    });
}

function mostrarDetalhes(livro) {

    //Entender o motivo desse d-none.
    document.querySelector("#detalhes").classList.remove("d-none");
    document.querySelector("#detalheCapa").src = livro.capa;
    document.querySelector("#detalheTitulo").textContent = livro.titulo;
    document.querySelector("#detalheAutor").textContent = livro.autor;
    document.querySelector("#detalheEditora").textContent = livro.editora;
    document.querySelector("#detalhePaginas").textContent = livro.paginas;
    document.querySelector("#detalheCategoria").textContent = livro.categorias;

    if (livro.analise) {

        document.querySelector("#detalheResumo").textContent =
            livro.analise.resumo;

        document.querySelector("#detalheLeitor").textContent =
            livro.analise.tipoLeitor;

        document.querySelector("#detalheDificuldade").textContent =
            livro.analise.dificuldade;

        document.querySelector("#detalheCuriosidade").textContent =
            livro.analise.curiosidade;

        const listaTemas =
            document.querySelector("#detalheTemas");

        listaTemas.innerHTML = "";

        livro.analise.temas.forEach((tema)=>{

            const li = document.createElement("li");

            li.textContent = tema;

            listaTemas.appendChild(li);

        });
    }

        document.querySelector("#detalhes").scrollIntoView({
        behavior:"smooth"

    });
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

        Retorne neste formato:

        {
        "resumo": "",
        "tipoLeitor": "",
        "dificuldade": "",
        "temas": [],
        "curiosidade": ""
        }
        `;

    const resposta = await chamarGemini(prompt);

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


async function iniciar(genero) {

    livrosEncontrados = await buscarLivros(genero);

    if(livrosEncontrados.length === 0){
        return;
    }

    renderizarLivros();

    //Desce a tela após os livros serem renderizados.
    document.querySelector("#livros").scrollIntoView({
        behavior: "smooth"
    });
}

const btnBuscar = document.querySelector("#btnBuscar");

    btnBuscar.onclick = async () => {

    CONFIG.GOOGLE_BOOKS_KEY =
    document.querySelector("#googleKey").value.trim();

    CONFIG.GEMINI_KEY =
    document.querySelector("#geminiKey").value.trim();

    if (CONFIG.GOOGLE_BOOKS_KEY === "" || CONFIG.GEMINI_KEY === "") {
        alert("Informe as duas chaves da API.");
        return;
    }
    
    // pega o gênero
    const genero = document.querySelector("#genero").value;

    await iniciar(genero);
};