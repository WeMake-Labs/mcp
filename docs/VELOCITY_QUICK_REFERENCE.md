# CodeRabbit Velocity Quick Reference

> **Actionable recommendations to maximize development velocity with minimal cognitive load**

---

## 🚀 Immediate Actions (Do These Now)

### 1. Enable CodeRabbit on Your Repository

```bash
# Commit the configuration
git add .coderabbit.yaml CODERABBIT_CONFIGURATION_SUMMARY.md VELOCITY_QUICK_REFERENCE.md
git commit -m "Configure CodeRabbit for maximum development velocity"
git push
```

### 2. Configure GitHub Repository Settings

- Go to your repository settings
- Enable CodeRabbit app (if not already enabled)
- Set branch protection to require CodeRabbit checks
- Allow auto-labeling

### 3. Create Your First Test PR

```bash
# Make a small change to test the configuration
git checkout -b test/coderabbit-validation
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: Validate CodeRabbit configuration"
git push -u origin test/coderabbit-validation
```

**Expected Results:**

- ✅ Automatic PR labels applied
- ✅ Comprehensive walkthrough generated
- ✅ Custom checks run (5 checks)
- ✅ Tool integrations active (ESLint, Biome, etc.)
- ✅ Suggested improvements with context

---

## 🎯 Daily Workflow Optimizations

### Morning Routine

1. **Check CodeRabbit summary** before reviewing PR details
2. **Trust auto-labels** to prioritize which PRs to review first
3. **Read custom check results** before diving into code

### Creating PRs

```bash
# Use descriptive titles - CodeRabbit will auto-label
git commit -m "feat(mcp-server): Add new tool for X"  # → mcp-server label
git commit -m "fix(workers): Remove Bun.file usage"   # → workers-deployment label
git commit -m "docs: Update README installation"      # → documentation label
git commit -m "test: Add edge case coverage"          # → tests label

# Skip review for WIP work
git commit -m "WIP: Experimental feature"             # → Ignored by CodeRabbit
```

### Reviewing PRs

1. **Read high-level summary first** (at top of PR)
2. **Check custom pre-merge checks** (bottom of review)
3. **Review flagged issues** (assertive profile catches more)
4. **Apply suggested fixes** (often copy-paste ready)

---

## 💡 Cognitive Load Reducers

### Labels Tell You Everything

- `mcp-server` → MCP server implementation changes
- `workers-deployment` → Affects Cloudflare Workers
- `documentation` → README or markdown updates
- `tests` → Test file changes
- `security` → Security-related changes
- `breaking-change` → API changes requiring attention
- `needs-coverage` → Test coverage below 90%
- `bun-compatibility` → Bun usage pattern changes

**Action:** Sort PRs by label to batch similar reviews

### Custom Checks Save Time

1. **Bun-Only APIs Check** - Catches Workers incompatibility
2. **Test Coverage** - Ensures 90%+ coverage
3. **Workers Deployment** - Validates production readiness
4. **Bun Command Usage** - Enforces bun/bunx only
5. **MCP Server Pattern** - Validates standard patterns

**Action:** If custom check fails, fix before manual review

### Path Instructions Guide You

CodeRabbit knows your standards for:

- MCP server entry points (`index.ts`)
- Workers deployment (`worker.ts`)
- Tests (`*.test.ts`)
- Documentation (`README.md`)
- Workers config (`wrangler.toml`)

**Action:** Trust path-specific feedback - it's based on your .cursor/rules/

---

## 🔥 Power User Tips

### 1. Leverage Auto-Generated Content

CodeRabbit can generate:

- **Docstrings** - JSDoc with business context
- **Unit tests** - Bun native test patterns
- **PR titles** - Use `@coderabbitai` in title
- **PR descriptions** - Use `@coderabbitai summary` placeholder

**Example:**

```markdown
## Pull Request

@coderabbitai summary

<!-- CodeRabbit will fill this in automatically -->
```

### 2. Chat with CodeRabbit

In PR comments, ask CodeRabbit:

```markdown
@coderabbitai Can you suggest test cases for this function? @coderabbitai Is this Workers-compatible? @coderabbitai
What's the test coverage impact? @coderabbitai Generate JSDoc for this class
```

### 3. Use Blocking Workflow

With `request_changes_workflow: true` enabled:

- ❌ PRs with unresolved issues can't merge
- ✅ Forces fixing issues before merge
- ⚡ Reduces technical debt accumulation

**Action:** Embrace the friction - it saves time later

### 4. Monitor Custom Checks

If a custom check frequently flags false positives:

1. Note the pattern
2. Adjust the check in `.coderabbit.yaml`
3. Commit the update
4. CodeRabbit learns immediately

---

## 📊 Velocity Metrics to Track

### Week 1: Baseline

- PRs created: \_\_\_
- CodeRabbit comments: \_\_\_
- Auto-applied labels: \_\_\_
- Manual reviews needed: \_\_\_

### Week 2-4: Optimization

- Time saved on reviews: \_\_\_
- Issues caught pre-merge: \_\_\_
- Documentation generated: \_\_\_
- Test coverage trend: \_\_\_

**Goal:** 40-60% reduction in manual review effort

---

## 🛠️ Troubleshooting

### CodeRabbit Not Commenting

1. Check app permissions in GitHub
2. Verify `.coderabbit.yaml` syntax: `bunx js-yaml .coderabbit.yaml`
3. Check if PR title contains ignore keywords (WIP, Draft)

### Custom Checks Not Running

1. Ensure `request_changes_workflow: true` is set
2. Wait for GitHub checks (3-minute timeout configured)
3. Check CodeRabbit logs in PR

### Labels Not Auto-Applying

1. Verify `auto_apply_labels: true`
2. Check label exists in repository
3. Review `labeling_instructions` for matches

### Too Many Comments (Overwhelming)

**Temporary fix:**

```yaml
reviews:
  profile: "chill" # Less feedback
```

**Better approach:**

- Trust the process for 2 weeks
- Assertive profile helps learning
- Comments reduce as code quality improves

---

## 🎓 Learning Path

### Week 1: Understanding

- Read all CodeRabbit comments
- Don't skip any suggestions
- Learn patterns it catches

### Week 2: Trusting

- Apply suggestions without verifying each one
- Trust custom checks
- Use auto-labels for prioritization

### Week 3: Optimizing

- Adjust custom checks based on feedback
- Refine labeling instructions
- Add path instructions for new patterns

### Week 4: Automating

- Pre-emptively fix issues before CodeRabbit flags them
- Write code that passes first time
- Internalize the patterns

**Result:** AI becomes invisible because you've learned the patterns

---

## 🔑 Key Mental Models

### 1. CodeRabbit is Your Junior Developer

- Give it clear patterns (✅ done via path_instructions)
- Let it catch obvious issues (✅ done via custom checks)
- Trust it to follow rules (✅ done via code_guidelines)

### 2. Labels are Your Sorting Hat

- Don't think about categorization
- Let CodeRabbit label automatically
- Use labels to batch similar work

### 3. Custom Checks are Your Safety Net

- They enforce enterprise standards
- They catch Bun/Workers incompatibility
- They ensure test coverage
- They validate MCP patterns

### 4. Path Instructions are Context

- CodeRabbit knows different rules for different files
- No need to remember which standards apply where
- Context-aware feedback reduces noise

---

## 📈 Expected Velocity Gains

### Immediate (Week 1)

- ✅ 30% fewer manual review cycles
- ✅ 50% faster PR categorization (auto-labels)
- ✅ 100% compliance with Bun/Workers standards

### Short-term (Month 1)

- ✅ 50% reduction in review back-and-forth
- ✅ 90%+ test coverage maintained automatically
- ✅ Zero deployment issues from Bun API usage

### Long-term (Month 3+)

- ✅ 60% reduction in manual review effort
- ✅ Internalized patterns (write better code first time)
- ✅ Near-zero technical debt accumulation

---

## 🚨 When to Override CodeRabbit

### Acceptable Overrides

- Performance-critical code with unconventional patterns
- Third-party code integration workarounds
- Temporary hacks with TODO comments
- Experimental features in feature branches

### Document Overrides

```typescript
// CodeRabbit: Acceptable override
// Reason: Performance optimization for hot path
// TODO: Revisit when Bun adds native support
const result = await someBunSpecificAPI();
```

---

## 📞 Getting Help

### CodeRabbit Issues

- Documentation: https://docs.coderabbit.ai/
- Support: support@coderabbit.ai

### Configuration Issues

- Check: `CODERABBIT_CONFIGURATION_SUMMARY.md`
- Validate: `bunx js-yaml .coderabbit.yaml`
- Test: Create small test PR

### Workspace Issues

- Velocity Hub: `.cursor/rules/velocity.mdc`
- Workers Guide: `.cursor/rules/workers-deployment.mdc`
- MCP Protocol: `.cursor/rules/mcp-protocol.mdc`

---

## 🎯 Success Checklist

After 2 weeks with this configuration, you should:

- [ ] Trust CodeRabbit labels without verifying
- [ ] Apply 80%+ of suggestions without questioning
- [ ] Rarely have PRs blocked by custom checks
- [ ] Write code that passes first review
- [ ] Spend <5 minutes per PR on review
- [ ] Have 90%+ test coverage on all new code
- [ ] Zero Workers deployment issues from Bun APIs
- [ ] Documentation generated automatically
- [ ] PRs merge within 24 hours
- [ ] Feel less cognitive load on reviews

---

**Remember:** The goal isn't to eliminate all manual review, but to eliminate **unnecessary** manual work. CodeRabbit
handles the routine stuff so you focus on architecture and business logic.

**Next Action:** Commit the configuration and create your first test PR! 🚀
