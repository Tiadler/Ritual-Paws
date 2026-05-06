# RitualTom Static Asset Folder

Put final game art in this folder. Folder and file names are intentionally English and fixed so the frontend can call assets by path.

## Required folders

```text
public/static/
├── Pet/
│   ├── Pet(1).png or Pet(1).svg
│   ├── Pet(2).png or Pet(2).svg
│   └── ... Pet(10).png or Pet(10).svg
├── ThemeBackgroundRoom/
│   ├── ThemeBackgroundRoom(1).png or .svg
│   └── ...
├── Hat/
│   ├── Hat(1).png or .svg
│   └── ...
├── Glass/
│   ├── Glass(1).png or .svg
│   └── ...
├── Necklace/
│   ├── Necklace(1).png or .svg
│   └── ...
├── Shirt/
│   ├── Shirt(1).png or .svg
│   └── ...
└── Handheld/
    ├── Handheld(1).png or .svg
    └── ...
```

## Important naming rule

The frontend currently points to `.svg` by default in `lib/staticAssets.ts`.

If you draw PNG instead, either:

1. Export as `.svg` with the exact names above, or
2. Open `lib/staticAssets.ts` and change `.svg` paths to `.png`.

## Pet color mapping

```text
black  -> Pet(1)
white  -> Pet(2)
cream  -> Pet(3)
orange -> Pet(4)
gray   -> Pet(5)
brown  -> Pet(6)
pink   -> Pet(7)
blue   -> Pet(8)
purple -> Pet(9)
green  -> Pet(10)
```

## Fixed item slots

Item overlay positions are controlled in:

```text
lib/staticAssets.ts
```

Search for:

```text
PET_ITEM_SLOTS
```

Adjust `top`, `left`, `width`, and `transform` once if your final pet art has different proportions.
