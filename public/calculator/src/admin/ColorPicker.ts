// (c) Nicole Collings 2019-present, all rights reserved.

class ColorPicker {
	constructor(name, parent, table_key, transparent = false) {
		const colors = [
			{name: "orange",		hex: "#ff5722"},
			{name: "magenta", 	hex: "#e91e63"},
			{name: "indigo", 		hex: "#673ab7"},
			{name: "cyan",			hex: "#00bcd4"},
			{name: "neutral",		hex: "#607d8b"},
			{name: "lime",			hex: "#8bc34a"},
			{name: "neon",			hex: "#ffeb3b"},
			{name: "earth",			hex: "#795548"},
			{name: "red", 			hex: "#f44336"},
			{name: "lavender", 	hex: "#9c27b0"},
			{name: "navy",			hex: "#3f51b5"},
			{name: "blue",			hex: "#2196f3"},
			{name: "teal",			hex: "#009688"},
			{name: "green",			hex: "#4caf50"},
			{name: "gold",			hex: "#ff9800"},
		];

		if (transparent) colors.push({name: "trans", hex: "rgba(127,127,127,0.07)"});
		else colors.push({name: "black", hex: "#000"});

		let selected = DATA.theme[table_key];

		for (let color of colors) {
			parent.append($(`<input ${selected == color.name ? "checked" : ""} class="color_picker" type="radio" 
											id="${name + "_" + color.name}" name="${name}" value="${color.name}">`));
			parent.append($(`<label class="color_picker" for="${name + "_" + color.name}" style="background-color: ${color.hex};">`));
		}
	}
}
