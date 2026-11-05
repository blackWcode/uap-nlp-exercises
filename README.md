# UAP NLP Exercises

> **Work in progress.** This is part of a small learning project on knowledge graphs. The README will be updated when the experiment is finished.

**Website:** https://blackwcode.github.io/uap-nlp-exercises/

## About

This notebook recreates **Exercises 1.2 and 1.3** of the openHPI course *Knowledge Graphs – Foundations and Applications*. It uses texts from UAP (unidentified anomalous phenomena) reports instead of the course examples.

It tests how standard NLP tools handle these texts: messy historical reports, non-English place names, and ambiguous words. This is an early step towards building a knowledge graph from UAP reports.

Two cases are used:

- **Brazilian "Official UFO Night"** (*Noite Oficial dos OVNIs*), 19/05/1986: radar and visual sightings over several Brazilian states.
- **Washington, D.C. sightings**, night of 26–27/07/1952: a USAF Project Blue Book incident report.

*All dates are written as dd/mm/yyyy.*

## Contents

| File | Description |
|---|---|
| `Recreate_UAP_Exercises.ipynb` | Main notebook: NLP pipeline, NER corrections, model comparison and word sense disambiguation |
| `sources/BR_DFANBSB_ARX_0_0_0249_d0001de0001_ocr.pdf` | Primary source: original Brazilian Air Force occurrence report (1986), in Portuguese, scanned with OCR |
| `sources/Brazilian_Air_Force_1986_Portuguese_English_Translation.pdf` | Bilingual Portuguese–English working translation of the report (machine translation; see Sources) |
| `index.html`, `style.css`, `script.js`, `favicon.svg`, `.nojekyll` | Project website (static, served by GitHub Pages) |

## What the notebook does

0. **Setup**: installs spaCy and its English models
1. **NLP pipeline** on the gov.br article about the Brazilian case: tokenisation, lemmatisation, POS tagging, dependencies and named entity recognition (NER), with displaCy visualisations
2. **Rule-based correction**: an `EntityRuler` with the four Brazilian states named in the article
3. **Model comparison**: spaCy small vs medium models, plus a gazetteer test with GeoText
4. **Context-based correction**: a rule that uses the words around an entity (e.g. *in*, *over*, *states*) to label places
5. **Generalisation test**: the context rule applied to ambiguous "Washington" sentences
6. **Word sense disambiguation**: WordNet senses of *light* and *track*, with the NLTK Lesk algorithm and an improved Lesk
7. **Historical source**: NER on a Project Blue Book paragraph, comparing the sm, md and lg models against expected labels predicted beforehand

## Findings so far

Summarised from the results sections of the notebook:

- The spaCy models struggled with Brazilian state names. Each model labelled only one of the four states correctly, and some were labelled as PERSON or ORG. A likely reason is that the models were trained on English web and news text.
- The rule-based list fixed all four states, but it only works for the names on the list.
- GeoText labelled the states as cities, because cities with the same names exist. A gazetteer can find known place names, but it cannot use context to decide what kind of place they are.
- The context-based rule corrected all the wrong labels without a country-specific list. On the Washington sentences it changed nothing, which shows it did not turn people's names into places. It has not yet been shown to fix errors in new sentences.
- The NLTK Lesk algorithm chose the wrong sense of *light* in both test sentences. It also chose the wrong sense of *tracked* in the radar sentence.
- On the Blue Book paragraph, all three models scored 4 out of 8, with different mistakes. The larger model did not perform better. The models did better on this English text than on the Brazilian place names.

## Limitations

- Only one paragraph from the Blue Book file was analysed, so the results may not hold for other historical reports.
- The Blue Book text is a transcription from the Project 1947 website, not the original scanned document.
- The transformer model (`en_core_web_trf`) could not be loaded because of a compatibility problem between Python 3.14 and PyTorch.
- The expected labels were decided by one person; a second, independent labeller would make them more reliable.

## How to run

- **Python:** 3.14 (Jupyter Notebook)
- **Packages:** `spacy`, `pandas`, `nltk`, `geotext`
- **spaCy models:** `en_core_web_sm`, `en_core_web_md`, `en_core_web_lg`
- **NLTK data:** `wordnet`, `stopwords`

```bash
pip install spacy pandas nltk geotext
python -m spacy download en_core_web_sm
python -m spacy download en_core_web_md
python -m spacy download en_core_web_lg
```

The Setup section installs the packages and models. After that, run the cells in order.

## Sources

**Course**
- Sack, H., Bruns, S., Tan, M. A., Tietz, T. and Vafaie, M. *Knowledge Graphs – Foundations and Applications*. openHPI, Hasso Plattner Institute (FIZ Karlsruhe & Karlsruhe Institute of Technology). https://open.hpi.de/courses/knowledgegraphs2023 (accessed 01/10/2026). Course material licensed under CC BY-NC 3.0.

**Brazilian case (19/05/1986)**
- Government of Brazil (2022). "Official UFO Night in Brazil". gov.br, 20/05/2022. https://www.gov.br/en/government-of-brazil/latest-news/2022/official-ufo-night-in-brazil (accessed 07/10/2026). *Secondary source; text analysed in Sections 1–4.*
- Lyra, R. (2017). "Arquivos Abertos – OVNIs nos céus do Brasil". *Revista Imprensa Nacional – Novos Rumos da Comunicação Pública*, Year 1, No. 3, September 2017, pp. 33–34 (in Portuguese). *Secondary source; not included in this repository.*
- Comando Aéreo de Defesa Aérea (COMDA), Ministério da Aeronáutica (1986). *Relatório de Ocorrência*, Official Letter No. 008/CMDO/C-138, Brasília, 02/06/1986. Archive file BR_DFANBSB_ARX_0_0_0249_d0001de0001. *Primary source; included in `sources/`.* The English working translation is a machine translation (GPT-6.1, 11/10/2026).

**Washington, D.C. case (26–27/07/1952)**
- Project 1947. "Washington D.C. UFO Overflights, July 26/27, 1952". Transcription of a USAF Project Blue Book document; originals held by the US National Archives. https://www.project1947.com/fig/1952c.htm (accessed 24/10/2026). *Not included in this repository.*

**Note:** The sources differ in some details. For example, the gov.br article mentions four states and objects up to 100 metres, while the magazine mentions three states. These differences will be represented as separate claims in the knowledge graph.

## Author

[blackWcode](https://github.com/blackWcode)
