---
name: synergy-experimental-protocol
description: Quantitative statistical protocol and experimental design requirements for proving non-obvious synergism to overcome Section 3(e) mere admixture rejections.
---

# Section 3(e) Synergistic Experimental Protocol Playbook

## 1. Statutory Background & Mere Admixture Threshold
Section 3(e) of **The Patents Act, 1970** excludes from patentability:
> *"a substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance."*

To overcome a Section 3(e) objection, the applicant must scientifically demonstrate that the combination exhibits **true synergism**—where the combined biological/therapeutic activity is statistically significantly greater than the mathematical sum of the individual components ($Effect(A+B) > Effect(A) + Effect(B)$).

---

## 2. Quantitative Synergism Protocols

### Protocol 1: Chou-Talalay Combination Index (CI) Method
The Chou-Talalay method is the internationally recognized gold standard for drug combination analysis and is accepted by patent offices (CGPDTM, USPTO, EPO).

1. **Median-Effect Equation**:
   $$\frac{f_a}{f_u} = \left(\frac{D}{D_m}\right)^m$$
   Where $f_a$ is the fraction affected, $f_u = 1 - f_a$ is the fraction unaffected, $D$ is dose, $D_m$ is median-effect dose ($IC_{50}$ or $ED_{50}$), and $m$ is the sigmoid slope.

2. **Combination Index ($CI$) Formula**:
   $$CI = \frac{(D)_1}{(D_x)_1} + \frac{(D)_2}{(D_x)_2}$$
   Where $(D)_1$ and $(D)_2$ are the doses of Herb 1 and Herb 2 in the combination giving effect $x$, and $(D_x)_1$ and $(D_x)_2$ are individual doses giving the same effect.

3. **Statutory Interpretation**:
   - **$CI < 0.9$**: Significant Synergism (Successfully overcomes Section 3(e)).
   - **$0.9 \le CI \le 1.1$**: Additive / Aggregation of properties (Rejected under Section 3(e)).
   - **$CI > 1.1$**: Antagonism (Rejected under Section 3(e)).

### Protocol 2: Isobologram Analysis
- Plot an isobologram at $ED_{50}$, $ED_{75}$, and $ED_{90}$ concentration levels.
- Construct the line of additivity connecting individual component doses.
- Data points falling **strictly below the line of additivity (concave curve)** constitute prima facie evidence of true synergy.

### Protocol 3: Experimental Matrix & Control Benchmarks
Every patent specification and response affidavit must include at least 4 test groups:
1. **Group 1**: Component A alone (across 5 dosage levels).
2. **Group 2**: Component B alone (across 5 dosage levels).
3. **Group 3**: Physical Admixture (Component A + B mixed without specific formulation technology).
4. **Group 4**: Claimed Formulation (Component A + B prepared according to the invention's novel process).

---

## 3. Section 3(e) Evidence Affidavit Checklist
- [ ] Dose-response curves with $IC_{50}$ / $EC_{50}$ values for each individual component.
- [ ] Calculated Combination Index ($CI$) values at $ED_{50}$, $ED_{75}$, and $ED_{90}$.
- [ ] Graphical isobologram showing points below the line of additivity.
- [ ] Statistical significance demonstrated ($p < 0.01$ via ANOVA with post-hoc Tukey test).
- [ ] Affidavit executed by the lead pharmacologist / scientist under Indian Oaths Act.
