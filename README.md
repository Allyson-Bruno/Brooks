# Brooks 0.1
Um buscador de livros inteligente que se utiliza a Google Books API para trazer uma lista de livros tendo como o base o gênero dos livros como filtro para suas buscas. 

A partir disso quando o usuário selecionar um livro da lista a Gemini API fará uma análise contendo resumo, público recomendado, nível de dificuldade, principais temas e uma curiosidade sobre cada obra. 

Ademais, o projeto utiliza a Open Library Covers API para obter capas de livros (quando disponíveis) em maior resolução sempre que possível.

# Tecnologias utilizadas.
* HTML5
* CSS3
* JavaScript
* Google Books API
* Gemini API
* Open Library Covers API.

# Fluxo da aplicação.

O funcionamento da aplicação ocorre da seguinte maneira:

1. O usuário informa sua chave da Google Books API e da Gemini API.
2. Em seguida, seleciona um gênero literário e inicia a pesquisa.
3. A aplicação realiza uma requisição para a Google Books API buscando livros do gênero selecionado.
4. Os resultados passam por alguns filtros, removendo conteúdos adultos e determinados títulos previamente bloqueados.
5. Para cada livro encontrado, é montado um objeto contendo informações como título, autor, descrição, editora, número de páginas e capa.
6. Os livros são exibidos em formato de cards na página principal.
7. Ao clicar em um card, a aplicação envia as informações do livro para a Gemini API.
8. O Gemini retorna uma resposta em formato JSON contendo:
  *resumo.
  *leitor recomendado.
  *dificuldade de leitura.
  *principais temas.
  *curiosidade sobre a obra.

Essas informações são exibidas na seção de detalhes do livro.

# Como utilizar?

Para utilizar o Brooks será necessário possuir duas chaves de API:

*Google Books API.
*Gemini API.

Abaixo um guia para a obtenção destas chaves, além de instruções de uso de ambas.

# Gerando as chave do Google Books.

A chave do Google Books pode ser gerada através do site Google Cloud Console. 

Link para ir direto para a "Books Api":

https://console.cloud.google.com/marketplace/product/google/books.googleapis.com

Caso a página não abra diretamente na API, pesquise por Books API.

Após habilitá-la:

1. Clique em **gerenciar**.
2. No menu lateral, selecione **Credenciais**.
3. Clique em ***Criar credenciais***.
4. Escolha **Chave de API**

Agora use a chave gerada em seu campo correspodente do Brooks.

# Gerando a chave do Gemini.

A chave do Gemini pode ser gerada atráves do Google AI Studio. 

Link:

https://aistudio.google.com/app/u/4/api-keys

Para criar uma nova chave:

1. Sua conta deve ser de maior de idade, caso não seja realize a verifição de idade primeiro.
2. Selecione ou crie um novo projeto.
3. Clique em **Criar nova chave API**

Agora use essa chave em seu campo referente a Gemini API do Brooks.

Com as chaves geradas, basta aproveitar e realizar as buscas aos livros!

# O futuro.

Muito do que gostaria de adicionar na versão base Brooks, infelizmente teve que ser cortado devido ao tempo. Portanto, para o Brooks 0.2 os principais objetivos são:

1. Adicionar pesquisa por ano de publicação.
2. Uma melhora no desing do site, como foco na parte de detalhes traziadas pelo livro.
3. Permitir a busca específica por um único livro, além de permitir que pesquise livros correlatos a partir desse mesmo.
4. Disponibilizar links para compra dos livros em lojas como Amazon, Mercado Livre e Shoppe.
5. Implementar cache das análises realizadas pelo Gemini, reduzindo o consumo de requisições.

No geral são essas ideias no momento, e espero um dia no futuro realizar uma implementção completa do Brooks!

# Observação final.

Durante a utilização fique atento a taxa limite de requisições diárias, caso esteja utilizando o plano gratuito, uma vez que suas respectivas chaves de API's podem se esgotar, inutilizando o serviço. Logo, deixo esse aviso com destaque para o gemini que possui um limite bem baixo (25) requisições diárias, enquanto a Books APi não será necessário se preocupar.
