# 2D Kronig-Penney Web App Presentation

Use this as a ready-to-present slide deck script for PowerPoint or Canva.

---

## Slide 1: Title

### On-slide title
**2D Kronig-Penney Band Structure Web App**

### On-slide subtitle
Interactive browser-based simulation for band formation, gap opening, localization, and graphene-like behavior

### On-slide footer
- Presenter: Brijesh
- Course / Department
- Date

### Speaker notes
Good morning. Today I am presenting my 2D Kronig-Penney band structure web app. The goal of this project was to make core solid-state physics concepts interactive and visual. Instead of only viewing static textbook diagrams, the user can tune a periodic potential, observe how the band structure changes, and directly connect the band plot to real-space wavefunction behavior.

### Visual suggestion
- Put a clean screenshot of the app on the right
- Keep title and subtitle on the left

---

## Slide 2: Motivation

### On-slide title
**Why I Built This**

### On-slide bullets
- Band structure is fundamental in solid-state physics
- Static plots are difficult to connect to physical intuition
- Students often see energy bands, but not how they emerge
- I wanted one tool that links:
  - periodic potential
  - reciprocal-space band structure
  - real-space wavefunction structure

### Speaker notes
The motivation for this project was educational. In many physics courses, band structure is introduced through equations and static plots. But students often do not clearly see how a periodic potential produces bands, why a gap opens at the Brillouin-zone boundary, or how those effects appear in real-space wavefunctions. So I wanted to build an interactive tool that makes those connections much clearer.

### Visual suggestion
- Left: bullets
- Right: simple crystal-lattice sketch plus a static band diagram

---

## Slide 3: Physics Model

### On-slide title
**Physics Model**

### On-slide bullets
- 2D Kronig-Penney type periodic potential
- Plane-wave / matrix-mechanics solution
- Hamiltonian:

```text
H_G,G' = |k + G|² δ_G,G' + V_(G-G')
```

- Reciprocal basis:

```text
G = n_x b1 + n_y b2
```

- Supports:
  - square lattice
  - hexagonal lattice
  - graphene-like two-site basis

### Speaker notes
The app uses a 2D periodic potential and solves the band structure using a plane-wave basis. The Hamiltonian has a kinetic term and a periodic-potential coupling term in reciprocal space. The reciprocal lattice vectors define the basis, and the app supports both square and hexagonal lattices. I also extended it to include a graphene-like two-site basis in the hexagonal case.

### Visual suggestion
- Put the Hamiltonian in a highlighted equation box
- Add a small reciprocal-lattice sketch next to it

---

## Slide 4: What the App Does

### On-slide title
**Main Features**

### On-slide bullets
- Interactive band structure plot
- Real-space potential visualization
- Wavefunction visualization:
  - \|u_k\|²
  - Re(u_k)
  - arg(u_k)
- Exact X/K state comparison
- Physics presets:
  - Nearly Free
  - Gap Opening
  - Strong Localization
  - Graphene near-Dirac
- Responsive desktop/mobile UI

### Speaker notes
This app is not just a band plot. It allows the user to inspect the real-space potential, select a band, and then view the periodic part of the wavefunction. It also includes exact X-point or K-point state comparison tools, along with preset physics regimes that make the main phenomena easy to explore immediately.

### Visual suggestion
- Use one annotated screenshot with callouts to presets, band plot, and real-space panel

---

## Slide 5: Numerical Method

### On-slide title
**Numerical Method**

### On-slide bullets
- Plane-wave basis truncated at cutoff `n_max`
- Hamiltonian size grows with basis size
- Bands sampled along high-symmetry path
- Boundary gap used as convergence monitor
- Auto-convergence condition:

```text
|gap_new - gap_old| < 10^-3
```

- Separate validation script checks solver consistency

### Speaker notes
Numerically, the app uses a truncated plane-wave basis controlled by the cutoff n_max. Larger cutoff means a larger Hamiltonian and better convergence. The band structure is sampled along the standard high-symmetry path, and the change in the boundary gap is used as a convergence indicator. I also included a validation script to confirm that the solver remains consistent.

### Visual suggestion
- Small schematic: `n_max ↑ -> matrix size ↑ -> accuracy ↑`

---

## Slide 6: Physics Demonstrated

### On-slide title
**Physics Demonstrated**

### On-slide bullets
- **Nearly Free**
  - folded free-electron-like bands
- **Gap Opening**
  - Bragg reflection opens the X-point gap
- **Strong Localization**
  - deeper wells flatten low bands
  - density becomes more localized
- **Graphene near-Dirac**
  - hexagonal two-site basis
  - very small K-point gap

### Speaker notes
The app is organized around four key regimes. In the nearly free regime, the bands stay close to folded free-electron curves. In the gap-opening regime, Bragg reflection splits the boundary states and opens the X-point gap. In the strong-localization regime, deeper wells flatten the low-energy bands and localize the density. In the graphene-like regime, the two-site hexagonal basis produces a very small K-point gap and near-Dirac behavior.

### Visual suggestion
- Show four mini screenshots or thumbnails, one per preset

---

## Slide 7: Why the Wavefunction View Matters

### On-slide title
**Band Plot + Real Space**

### On-slide bullets
- Band plot shows energy structure
- Real-space panel shows spatial structure
- The app reconstructs the periodic part:

```text
u_k(x,y)
```

- Displays:
  - \|u_k\|² -> localization
  - Re(u_k) -> nodal structure
  - arg(u_k) -> phase texture

### Speaker notes
One of the most useful parts of the app is the wavefunction view. A band plot alone only shows energy as a function of k. But the real-space panel shows what the selected state actually looks like. The density shows localization, the real part shows nodal structure, and the phase shows how the periodic part varies across the unit cell. This makes the band physics much more intuitive.

### Visual suggestion
- Show one selected band point and the corresponding real-space wavefunction next to it

---

## Slide 8: UI/UX Design Goal

### On-slide title
**Designed as an Interactive Physics Tool**

### On-slide bullets
- Plot-first interface
- Preset-first exploration
- Hover + click state inspection
- Selected-state inspector
- Dynamic teaching prompts:
  - current phenomenon
  - why it happens
  - what to try next
- Responsive for desktop and mobile

### Speaker notes
I wanted the app to feel like an educational physics simulation rather than just a technical control panel. So the interface is centered on the band plot, presets are the first entry point, selected-state inspection is emphasized, and the app gives contextual teaching prompts to help the user understand what is happening and what to try next.

### Visual suggestion
- Use a screenshot with arrows labeling presets, band plot, state inspector, and teaching panel

---

## Slide 9: Limitations

### On-slide title
**Limitations**

### On-slide bullets
- Simplified pedagogical model
- Energies shown in scaled units
- Not an ab initio material simulation
- Graphene mode is graphene-like, not full realistic graphene
- Accuracy depends on finite basis cutoff
- Focus is educational clarity, not material prediction

### Speaker notes
It is important to be clear about scope. This is a simplified educational simulation, not a first-principles materials code. The energies are shown in scaled units, and the graphene mode is intended to reproduce graphene-like qualitative behavior rather than realistic full material properties. The focus is interaction and understanding.

### Visual suggestion
- Minimal slide
- Clean layout with one small caution/info icon

---

## Slide 10: Conclusion

### On-slide title
**Conclusion**

### On-slide bullets
- Built an interactive 2D band-structure simulation in the browser
- Demonstrates:
  - band formation
  - boundary gap opening
  - localization
  - graphene-like near-Dirac behavior
- Main contribution:

`Connecting periodic potential, band structure, and wavefunction structure in one interactive tool`

### On-slide ending
**Thank you**

### Speaker notes
In conclusion, this project is an interactive 2D band-structure simulation that brings together the periodic potential, the band plot, and the real-space wavefunction in one environment. Its main value is not only solving the model, but making the underlying physics visible, interactive, and easier to understand.

### Visual suggestion
- Final polished screenshot of the app
- Large concluding statement centered at the bottom

---

# Live Demo Plan

Use this exact demo order in front of your professor:

1. Open the app.
2. Start with **Nearly Free**.
3. Show how the bands resemble folded free-electron curves.
4. Switch to **Gap Opening**.
5. Point to the **X-point gap**.
6. Click a band near the boundary.
7. Show **|u_k|²** and explain the split standing-wave structure.
8. Switch to **Strong Localization**.
9. Show flatter bands and stronger localization in real space.
10. Switch to **Graphene near-Dirac**.
11. Show the **K-point zoom**.
12. Explain that the lowest two bands nearly touch.

---

# Opening Script

Today I will present my 2D Kronig-Penney band structure web app. The goal of this project was to build an interactive browser-based simulation that helps users understand how periodic potentials create energy bands, open gaps at the Brillouin-zone boundary, localize wavefunctions, and even produce graphene-like near-Dirac behavior.

---

# Closing Script

In summary, this project is a browser-based educational simulation for periodic quantum systems. Its main contribution is connecting periodic potential, reciprocal-space band structure, and real-space wavefunction structure in one interactive tool. Thank you.

---

# PowerPoint / Canva Style Guide

Use this style for the deck:

- Background: off-white / light cream
- Primary accent: dark blue
- Secondary accent: warm orange
- Title font: serif
- Body font: clean sans-serif
- Keep each slide to 3 to 5 bullets
- Use screenshots often
- Put long explanations only in speaker notes, not on slides

---

# One-Line Presentation Summary

This project is an interactive 2D band-structure web app that turns abstract solid-state physics into a visual and explorable simulation.
