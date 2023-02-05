const config = {
  "chart": {
    "container": "#OrganiseChart-big-commpany",
    "levelSeparation": 40,
    "siblingSeparation": 20,
    "subTeeSeparation": 30,
    "rootOrientation": "NORTH",
    "nodeAlign": "BOTTOM",
    "connectors": {
      "type": "step",
      "style": {
        "stroke-width": 2
      }
    },
    "node": {
      "HTMLclass": "big-commpany"
    }
  },
  "nodeStructure": {
    "text": {
      "name": "https://xabierlameiro.com"
    },
    "HTMLclass": "domain",
    "drawLineThrough": true,
    "collapsable": true,
    "connectors": {
      "style": {
        "stroke": "blue",
        "arrow-end": "oval-wide-long"
      }
    },
    "children": [
      {
        "text": {
          "name": "https:"
        },
        "stackChildren": true,
        "connectors": {
          "style": {
            "stroke": "#8080FF",
            "arrow-end": "block-wide-long"
          }
        }
      }
    ]
  }
}