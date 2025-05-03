import { Battle } from './battle.js';
import { Mob } from './mob.js';
import { Player } from './player.js';
import { CloneModifiers } from './dataclasses.js';

class Optimizer {
    constructor(player, mob, list_modifiers = null) {
        this.player = player;
        this.list_modifiers = list_modifiers;
        this.mob = mob;
        this.n_fights = 1000;
    }

    distribute_points(n_points) {
        // Distribute n points in k categories, only keeping those close to a 1:4:4:3 ratio within a given tolerance.
        const k = 4;
        const ratio = [1, 4, 4, 3];
        const ratio_sum = ratio.reduce((a, b) => a + b, 0);
        const ideal = ratio.map(r => Math.round(n_points * r / ratio_sum));
        const tolerance = 3;
        const results = [];
        function helper(remaining, parts) {
            if (parts.length === k - 1) {
                const last = remaining;
                const lcl = parts.concat([last]);
                if (lcl.every((val, i) => Math.abs(val - ideal[i]) <= tolerance)) {
                    results.push(lcl);
                }
                return;
            }
            for (let i = 0; i <= remaining; i++) {
                helper(remaining - i, parts.concat([i]));
            }
        }
        helper(n_points, []);
        return results;
    }

    optimize() {
        const opt_results = [];
        const nb_points = Math.floor((this.player.pow + this.player.pre + this.player.eva + this.player.hull) / 5);
        const possible_distributions = this.distribute_points(nb_points);
        for (const d of possible_distributions) {
            const power = 5 * d[0];
            const precision = 5 * d[1];
            const evasion = 5 * d[2];
            const hull = 5 * d[3];
            const tmp_player = new Player({
                power,
                precision,
                evasion,
                hull,
                weapon_dmg: this.player.weapon_dmg,
                shield_def: this.player.shield_def,
                n_clones: this.player.n_clones,
                vip_status: this.player.vip_status,
                weapon_ele1: this.player.weapon_ele1,
                weapon_ele2: this.player.weapon_ele2,
                shield_ele1: this.player.shield_ele1,
                shield_ele2: this.player.shield_ele2
            });
            const battle = new Battle({ player: tmp_player, mob: this.mob, list_modifiers: this.list_modifiers });
            const win_chance = battle.repeat_fights(this.n_fights);
            opt_results.push({ Stats: [power, precision, evasion, hull], 'Win chance': win_chance });
        }
        opt_results.sort((a, b) => b['Win chance'] - a['Win chance']);
        for (let i = 0; i < Math.min(3, opt_results.length); i++) {
            console.log(`${opt_results[i].Stats}: ${(opt_results[i]['Win chance'] * 100).toFixed(3)}%`);
        }
        const [power, precision, evasion, hull] = opt_results[0].Stats;
        const final_player = new Player({
            power,
            precision,
            evasion,
            hull,
            weapon_dmg: this.player.weapon_dmg,
            shield_def: this.player.shield_def,
            n_clones: this.player.n_clones,
            vip_status: this.player.vip_status,
            weapon_ele1: this.player.weapon_ele1,
            weapon_ele2: this.player.weapon_ele2,
            shield_ele1: this.player.shield_ele1,
            shield_ele2: this.player.shield_ele2
        });
        const battle = new Battle({ player: final_player, mob: this.mob, list_modifiers: this.list_modifiers });
        console.log(battle.get_revenue_print(opt_results[0]['Win chance']));
    }
}

export { Optimizer }; 