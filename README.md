# UrbanVolt ⚡

Aplicação de planejamento de trajetos para bicicletas elétricas, patinetes e motos elétricas. A pergunta central é: **a bateria disponível é suficiente para chegar e voltar?**

## Funcionalidades

- Mapa real com pesquisa de endereços, seleção de pontos e localização por GPS.
- Distância pelas vias, tempo estimado e horário de chegada.
- Bateria prevista no destino e na volta, com retorno calculado separadamente.
- Alertas de carga insuficiente e de pouca reserva.
- Parada de recarga A → B → C, incluindo a carga esperada e o tempo parado informados pelo usuário.
- Ajustes por veículo, autonomia, carga inicial, peso transportado e modo Eco, Normal ou Sport.
- Consulta a pontos de recarga mapeados e cadastro de pontos próprios em `localStorage`.
- Resumo para copiar ou compartilhar pelo WhatsApp, sem envio automático.

O aplicativo não exige conta própria. Os pontos salvos ficam somente no navegador usado.

## Como usar

1. Informe a cidade, origem e destino. Confirme o endereço encontrado ou escolha no mapa.
2. Selecione o veículo e informe sua autonomia real com bateria cheia, o peso transportado e a carga atual.
3. Marque **Incluir volta à origem** se desejar calcular o retorno imediato.
4. Se precisar, adicione uma recarga B e ajuste a carga ao sair e o tempo parado.
5. Clique em **Calcular minha rota**. Confira também a margem de reserva.

Para usar GPS, permita a localização no navegador. Confira a sinalização, o acesso às vias e a compatibilidade de cada ponto de recarga.

## Tecnologias e estrutura

HTML, CSS e JavaScript, sem etapa de compilação. [Leaflet](https://leafletjs.com/) exibe o mapa [OpenStreetMap](https://www.openstreetmap.org/copyright). [Photon](https://github.com/komoot/photon) pesquisa endereços; [FOSSGIS/OSRM](https://routing.openstreetmap.de/about.html) calcula rotas; [Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API) consulta os pontos de recarga.

| Arquivo | Função |
| --- | --- |
| `index.html` | Estrutura e controles da interface |
| `style.css` | Aparência e adaptação para celular |
| `core.js` | Modelo de autonomia e cálculo de bateria por trecho |
| `app.js` | Mapa, busca, rotas, armazenamento e compartilhamento |
| `tests/validate.cjs` | Verificações do cálculo e dos arquivos |
| `.nojekyll` | Publicação dos arquivos estáticos sem processamento Jekyll |

## Executar localmente

Sirva esta pasta por um servidor HTTP local, por exemplo com Python instalado:

```sh
python -m http.server 8000
```

Abra `http://localhost:8000`. Internet é necessária para mapas, endereços e rotas. Abrir o HTML diretamente como arquivo pode limitar GPS e consultas externas.

Os testes usam apenas recursos internos do Node.js:

```sh
node tests/validate.cjs
```

## Publicar no GitHub Pages

Em **Settings → Pages**, selecione **Deploy from a branch**, a branch `main` e a pasta **/(root)**. Salve e aguarde a publicação. [Instruções oficiais](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Como a bateria é estimada

```text
fator de peso = máximo(0,88; 1 + 0,004 × (peso em kg − 70))
fator do modo = Eco 0,85 / Normal 1,00 / Sport 1,25
autonomia ajustada = autonomia informada ÷ (fator de peso × fator do modo)
consumo em pontos percentuais = distância em km ÷ autonomia ajustada × 100
```

Os valores iniciais de autonomia são exemplos editáveis: 40 km para bike, 25 km para patinete e 70 km para moto. A referência é modo Normal com 70 kg transportados.

O cálculo é feito por trecho. A carga da parada B só é aplicada se houver bateria para alcançá-la. Uma meta menor que a bateria ao chegar não reduz a carga. O tempo parado informado é mantido. A volta parte diretamente do destino para a origem, sem outra recarga nem tempo de permanência no destino.

Chegadas com menos de 15% geram aviso de pouca reserva. Quando a energia necessária supera a disponível, o trecho é marcado como inviável. Uma chegada teórica com 0% também recebe aviso de pouca reserva.

## Limitações

**Bateria e horário são estimativas, não valores exatos nem garantia de chegada.** Não há telemetria, relevo, vento, temperatura, desgaste da bateria ou trânsito ao vivo no modelo. A autonomia informada precisa ser calibrada no veículo real.

O tempo usa velocidades médias por modo Eco / Normal / Sport: bike 16 / 20 / 24 km/h; patinete 12 / 16 / 20 km/h; moto 25 / 32 / 38 km/h. Essas suposições não representam limites legais. O tempo de recarga é informado pelo usuário; não é calculado pela potência do carregador.

Bike e patinete usam um perfil de bicicleta. Moto usa um perfil de automóvel como aproximação, sem regras específicas de motocicletas. O aplicativo planeja o trajeto; não oferece navegação curva a curva.

Os serviços públicos gratuitos podem ficar lentos ou indisponíveis. A consulta de recargas usa o espelho Overpass Private.coffee e pode exigir nova tentativa. Os dados podem estar incompletos ou desatualizados; um carregador para carro pode não atender uma bike. Para uso em grande escala, os serviços precisam de infraestrutura própria ou capacidade contratada.

## Privacidade

Endereços e coordenadas consultados são enviados aos serviços de busca e rotas. A consulta de recarga envia a área visível do mapa. O aplicativo não mantém banco de trajetos no servidor. Os pontos próprios são locais ao navegador e são removidos se seus dados forem apagados.

## Verificação

Os testes cobrem ida e volta, recarga alcançável e inalcançável, bateria zerada, chegada sem reserva, meta de recarga inferior à carga atual, tempo parado, peso/modo e dados inválidos. A interface foi verificada com rota real em São Paulo, alerta de volta insuficiente e cadastro local de pontos.
