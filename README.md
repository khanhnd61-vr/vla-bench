# VLA Bench

A static page on two robot manipulation benchmarks, LIBERO (with its zero-shot
variants) and CALVIN: what each varies between training and test, how each is scored,
and which test conditions policies can fit.

There is no build step: open `index.html`, or serve the folder with any static server.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

| Path | What it holds |
|---|---|
| `index.html` | The page |
| `assets/site.css` | Styles, in the theme of VLA Hub |
| `assets/app.js` | The data (task maps, perturbation results, variant index, CALVIN table layouts, audit numbers) and the script that draws the figures |

## Sources

- LIBERO task maps: coordinates from the LIBERO task (BDDL) files.
- LIBERO-PRO and LIBERO-Plus scores: the papers' own tables (LIBERO-PRO v1 Tables 2–5, LIBERO-Plus v3 Table 2).
- CALVIN table maps and evaluation rules: [`calvin`](https://github.com/mees/calvin) at `fa03f01` and
  [`calvin_env`](https://github.com/mees/calvin_env) at `797142c` (scene files, table URDFs, `multistep_sequences.py`).
- CALVIN redrawn-pose results: [2606.04233](https://arxiv.org/abs/2606.04233), Tables 1, 6 and 8. Not reproduced here.
