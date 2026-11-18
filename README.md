# VLA Bench

A static page on three robot manipulation benchmarks, LIBERO (with its zero-shot
variants), CALVIN and RoboTwin 2.0: what each varies between training and test, how each
is scored, and which test conditions policies can fit.

There is no build step: open `index.html`, or serve the folder with any static server.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

| Path | What it holds |
|---|---|
| `index.html` | The page |
| `assets/site.css` | Styles, in the theme of VLA Hub |
| `assets/app.js` | The data (task maps, perturbation results, variant index, CALVIN table layouts, RoboTwin 2.0 task scores, audit numbers) and the script that draws the figures |

## Sources

- LIBERO task maps: coordinates from the LIBERO task (BDDL) files.
- LIBERO-OOD task maps: the task files in [`pi0-text-latent`](https://github.com/QuanyiLi/pi0-text-latent) at `587a6cb`
  (`third_party/modified_libero/libero/libero/bddl_files/libero_{goal,spatial,object}_ood/`).
- LIBERO-PRO, LIBERO-Plus and LIBERO-OOD scores: the papers' own tables (LIBERO-PRO v1 Tables 2–5, LIBERO-Plus v3 Table 2,
  LIBERO-OOD [2505.03500](https://arxiv.org/abs/2505.03500) Table 3).
- CALVIN table maps and evaluation rules: [`calvin`](https://github.com/mees/calvin) at `fa03f01` and
  [`calvin_env`](https://github.com/mees/calvin_env) at `797142c` (scene files, table URDFs, `multistep_sequences.py`).
- CALVIN redrawn-pose results: [2606.04233](https://arxiv.org/abs/2606.04233), Tables 1, 6 and 8. Not reproduced here.
- RoboTwin 2.0 scene, randomization settings and test rules: [`RoboTwin`](https://github.com/RoboTwin-Platform/RoboTwin) at `ea8b211`
  (`envs/place_shoe.py`, `envs/_base_task.py`, `env_cfg/task_config/`, `scripts/eval_policy_xpolicylab.py`).
- RoboTwin 2.0 scores: the paper ([2506.18088](https://arxiv.org/abs/2506.18088) v2), Table 10; probe, X-VLA and MotuBrain:
  [2606.04233](https://arxiv.org/abs/2606.04233), Tables 1 and 3. Not reproduced here.
