# Brooks 0.1
Um buscador de livros inteligente que se utiliza de três API's para trazer uma lista de livros tendo como o base o gênero e ano a ser buscado. A partir da lista será gerado um resumo contendo detalhes do livro e uma curiosidade trazidas pelo gemini!

# Como utilizar?

Para utilizar o serviço oferecido pelo site será necessário ter chaves de API, sendo a primeira relecionada ao google books e a segunda do gemini, abaixo um guia para a obtenção destas chaves, além de instruções de como utilizá-las. 

# Gerando as chave do Google Books.

A chave do Google Books pode ser gerada através do site Google Cloud Console. Link para ir direto para a "Books Api"

https://console.cloud.google.com/marketplace/product/google/books.googleapis.com?q=search&referrer=search&authuser=4&project=focus-storm-500812-j7,

Caso não caia direto na API, basta pesquisar por "Books Api" e realizar sua habilitação, em seguida clique em gerenciar e no menu a esquerda credenciais.

Por fim, nesta aba basta clicar em criar crendencias e selecionar a opção de criar chave API e completar o procedimento básico.

# Gerando a chave do Gemini.

A chave do Gemini pode ser gerada atráves deste link:

https://aistudio.google.com/app/u/4/api-keys

Um projeto default será gerado, clicando no nome acima de "Default Gemini API Key", sem seguida no menu pop-up basta cópiar a chave no campu API KEY e colocar no input referente ao site.

Com as chaves geradas, basta aproveitar e realizar as buscas aos livros!

# O futuro.

Muito do que gostaria de adicionar na versão base Brooks, infelizmente teve que ser cortado devido ao tempo. Portanto, para o Brooks 0.2 tenho essses objetivos em mente:

1. Adicionar um novo parâmetro para a pesquisa: ano. Permitindo que o usuário direcione melhor o periódo dos livros pelo qual ele tem interesse.
2. Uma melhora no desing do site, como foco na parte de detalhes traziadas pelo livro.
3. Permitir a busca específica por um único livro, além de permitir que pesquise livros correlatos a partir desse mesmo.
4. Fornecer links com sites disponíveis para os livros que o usuário deseja comprar como Amazon, mercado livre e shoope.

No geral são essas ideias no momento, e espero um dia no futuro realizar uma implementção completa do Brooks!

# Observação final.

Durante a utilização fique atento a taxa limite de requisições diárias, caso esteja utilizando o plano gratuito, uma vez que suas respectivas chaves de API's podem se esgotar, inutilizando o serviço. Logo, deixo esse aviso com destaque para o gemini que possui um limite bem baixo (25) requisições diárias, enquanto a Books APi não será necessário se preocupar.
