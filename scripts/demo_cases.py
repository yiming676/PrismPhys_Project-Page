"""Discover every presentation-ready comparison case without modifying sources."""

from pathlib import Path


AMBI_OVERRIDES = {
    "page02/right__omni_ball_031_plasticine__drop_to_push": {
        "caseId": "plasticine-drop-push",
        "title": "Plasticine",
        "family": "Hencky elastoplasticity",
        "description": "A drop-observed tennis ball is pushed in the target rollout. Compare the flattened Hencky response against GT.",
    },
    "page03/left__omni_teddy_bear_007_metal__lift_to_drop": {
        "caseId": "metal-lift-drop",
        "title": "Metal-like bear",
        "family": "Corotational cellular",
        "description": "The source lift gives way to an unseen drop. Compare the inverted landing pose across methods.",
    },
    "page05/left__omni_ball_022_sand__push_to_stretch": {
        "caseId": "sand-push-stretch",
        "title": "Sand",
        "family": "Granular Drucker–Prager",
        "description": "A granular ball is stretched after a push observation. Watch the rounded outline and localized late indentation.",
    },
    "page06/left__physassets_154_rubber__push_to_shear": {
        "caseId": "rubber-push-shear",
        "title": "Rubber",
        "family": "Cross-interaction transfer",
        "description": "The dolphin is sheared after a short push observation. The two rows contrast source continuation with the unseen target.",
    },
}

PHYS_OVERRIDES = {
    "04_single_lift_dinosor": {
        "caseId": "real-dinosaur",
        "title": "Dinosaur",
        "interaction": "Point lift",
        "description": "Sky-blue predicted geometry is overlaid on the real recording. Two synchronized views show the point-lifted dinosaur.",
    },
    "08_single_lift_cloth": {
        "caseId": "real-cloth",
        "title": "Cloth",
        "interaction": "Corner lift",
        "description": "Predicted cloth contours are overlaid on GT in two views, exposing over- and under-prediction around the lifted corner.",
    },
}


def slug(value):
    return value.replace("_", "-").lower()


def ambi_object_label(value):
    if value.startswith("physassets_"):
        return f"Object {value[len('physassets_'):]}"
    if value.startswith("omni_"):
        value = value[len("omni_"):]
    return value.replace("_", " ").title()


def phys_object(case_name):
    for name in ("cloth", "sloth", "rope", "dinosor", "zebra"):
        if name in case_name:
            return "Dinosaur" if name == "dinosor" else name.title()
    return "Sequence"


def phys_interaction(case_name):
    if "clift" in case_name:
        return "Corner lift"
    if "double_lift" in case_name:
        return "Two-point lift"
    if "single_lift" in case_name:
        return "Point lift"
    if "single_push" in case_name:
        return "Push"
    if "double_stretch" in case_name:
        return "Stretch"
    return "Interaction"


def ambi_demos(assets):
    root = assets / "AmbiPhys-Bench-SkyBlue"
    demos = []
    for case in sorted(root.glob("page*/*")):
        if not case.is_dir():
            continue
        relative = case.relative_to(root).as_posix()
        _, object_material, interaction_slug = case.name.split("__")
        object_name, material = object_material.rsplit("_", 1)
        source, target = interaction_slug.split("_to_")
        override = AMBI_OVERRIDES.get(relative, {})
        case_id = override.get(
            "caseId",
            f"{slug(object_name)}-{material}-{source}-to-{target}",
        )
        family = override.get("family", material.title())
        description = override.get(
            "description",
            f"{family} case with {source} source observations and an unseen {target} target interaction. Compare GT and four methods in either camera view.",
        )
        source_dir = next(case.glob("source_same__*"))
        views = sorted(path.name for path in source_dir.glob("view_*") if path.is_dir())
        for index, view in enumerate(views):
            variant_id = (
                case_id
                if view == "view_00" and relative in AMBI_OVERRIDES
                else f"{case_id}-{view.replace('_', '')}"
            )
            demos.append(
                {
                    "id": variant_id,
                    "caseId": case_id,
                    "title": override.get("title", ambi_object_label(object_name)),
                    "dataset": "AmbiPhys-Bench",
                    "interaction": f"{source.title()} → {target.title()}",
                    "family": family,
                    "description": description,
                    "viewId": view,
                    "view": f"View {index + 1}",
                    "kind": "ambi",
                    "path": relative,
                    "sourceView": view,
                }
            )
    return demos


def phys_demos(assets):
    root = assets / "PhysTwin" / "cases"
    demos = []
    for case in sorted(root.iterdir()):
        if not case.is_dir():
            continue
        override = PHYS_OVERRIDES.get(case.name, {})
        object_name = phys_object(case.name)
        number = case.name.split("_", 1)[0]
        case_id = override.get("caseId", f"real-{object_name.lower()}-{number}")
        interaction = override.get("interaction", phys_interaction(case.name))
        demos.append(
            {
                "id": case_id,
                "caseId": case_id,
                "title": override.get("title", f"{number} · {object_name}"),
                "dataset": "PhysTwin",
                "interaction": interaction,
                "family": "Real-world video",
                "description": override.get(
                    "description",
                    f"Two synchronized camera views compare GT with four prediction methods for this real-world {object_name.lower()} sequence.",
                ),
                "viewId": "dual",
                "view": "Two views",
                "kind": "phystwin",
                "path": case.name,
            }
        )
    return demos


def discover_demos(assets):
    return ambi_demos(assets) + phys_demos(assets)
