
const campo = document.querySelector("#nomePokemon");
const botao = document.querySelector("#buscar");
const pokemon = document.querySelector("#pokemon");
const listaPokemon = document.querySelector("#listaPokemon");

// PÁGINA PRINCIPAL

async function buscarPokemon(nomePesquisado) {
  const nome = (
    nomePesquisado ?? campo.value
  ).trim().toLowerCase();

  if (!nome) {
    pokemon.innerHTML = "<p>Digite um Pokémon!</p>";
    return;
  }

  pokemon.innerHTML = "<p>Procurando Pokémon...</p>";

  try {
    const resposta = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`
    );

    if (!resposta.ok) {
      throw new Error("Pokémon não encontrado");
    }

    const dados = await resposta.json();

    // Atualiza a URL para permitir compartilhar o Pokémon selecionado.
    const url = new URL(window.location.href);
    url.searchParams.set("pokemon", dados.id);
    window.history.replaceState({}, "", url);

    campo.value = dados.name;

    pokemon.replaceChildren();

    const titulo = document.createElement("h2");
    titulo.textContent = dados.name;

    const imagem = document.createElement("img");
    imagem.src =
      dados.sprites.front_default ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dados.id}.png`;
    imagem.alt = dados.name;

    const altura = document.createElement("p");
    altura.textContent = `Altura: ${dados.height / 10} m`;

    const peso = document.createElement("p");
    peso.textContent = `Peso: ${dados.weight / 10} kg`;

    const numero = document.createElement("p");
    numero.textContent = `Número: ${dados.id}`;

    pokemon.append(
      titulo,
      imagem,
      altura,
      peso,
      numero
    );
  } catch (erro) {
    pokemon.innerHTML = `
      <p>Pokémon não encontrado! Tente outro nome ou número.</p>
    `;
  }
}

// Eventos da página principal

if (botao && campo && pokemon) {
  botao.addEventListener("click", () => buscarPokemon());

  campo.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
      buscarPokemon();
    }
  });

  // Se veio da lista, abre o Pokémon selecionado automaticamente.
  const parametros = new URLSearchParams(window.location.search);
  const pokemonSelecionado = parametros.get("pokemon");

  if (pokemonSelecionado) {
    buscarPokemon(pokemonSelecionado);
  }
}

// PÁGINA COM TODOS OS POKÉMON

async function carregarPokemons() {
  listaPokemon.innerHTML = "<p>Carregando Pokémon...</p>";

  try {
    const resposta = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0"
    );

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar a lista");
    }

    const dados = await resposta.json();
    const fragmento = document.createDocumentFragment();

    dados.results.forEach((item) => {
      // Extrai o número do Pokémon da URL retornada pela API.
      const id = Number(item.url.split("/").filter(Boolean).pop());

      const card = document.createElement("a");
      card.className = "card-pokemon";
      card.href = `index.html?pokemon=${id}`;
      card.setAttribute(
        "aria-label",
        `Ver informações de ${item.name}`
      );

      const numero = document.createElement("span");
      numero.className = "numero";
      numero.textContent = `Nº ${String(id).padStart(4, "0")}`;

      const imagem = document.createElement("img");
      imagem.src =
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
      imagem.alt = item.name;
      imagem.loading = "lazy";

      const nome = document.createElement("span");
      nome.className = "nome";
      nome.textContent = item.name;

      card.append(numero, imagem, nome);
      fragmento.appendChild(card);
    });

    listaPokemon.replaceChildren(fragmento);
  } catch (erro) {
    listaPokemon.innerHTML = `
      <p>Não foi possível carregar os Pokémon.
      Verifique sua conexão e recarregue a página.</p>
    `;
  }
}

// Só carrega a lista quando estamos em pokedex.html.

if (listaPokemon) {
  carregarPokemons();
}
