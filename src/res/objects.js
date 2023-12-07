var objects = [
	{
	    id:     'One_Stop_Shop',
	    name:   'One Stop Shop',
	    icon:   'LM_OneStopShop.png',
	    latlng: [-76,90],
	    image:       'preview_oneStopShop.jpg',
	    description: '<b>One Stop Shop</b> is selling and buying random junk<br><br>' +
		'<table class="hours_table">' +
		'<tr><td colspan="2">Opening hours:</td></tr>' +
		'<tr><th>Monday</th><td>08:00 - 18:00</td></tr>' +
		'<tr><th>Tuesday</th><td>08:00 - 18:00</td></tr>' +
		'<tr><th>Wednesday</th><td>08:00 - 18:00</td></tr>' +
		'<tr><th>Thursday</th><td>08:00 - 18:00</td></tr>' +
		'<tr><th>Friday</th><td>08:00 - 18:00</td></tr>' +
		'<tr><th>Saturday</th><td>10:00 - 16:00</td></tr>' +
		'<tr><th>Sunday</th><td>closed</td></tr>' +
		'</table>' +
		'<br><br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#One_Stop_Shop">See on the wiki</a></i>'
	},
	{
	    id:     'players_tenement',
	    name:   'Player\'s Tenement',
	    icon:   'LM_Tenement_Player.png',
	    latlng: [-14,110],
	    image:       'preview_playerment.jpg',
	    description: 'It\'s a 6 story building with additional basement and a roof space, owned by the Player<br>' +
		'<br><i><a href="https://stalburg.net/Player\'s_Tenement">See on the wiki</a></i>'
	},
	{
	    id:     'players_tenement',
	    name:   'Tenement Basement',
	    icon:   'LM_Tenement_Player.png',
	    latlng: [-60,76],
	    image:       'preview_TenementBasement.jpg',
	    description: 'Side entrance to the basement of Player\'s Tenement<br>' +
		'<br><i><a href="https://stalburg.net/Player\'s_Tenement">See on the wiki</a></i>'
	},
	{
	    id:          'canal_sauna',
	    name:        'Canal Sauna',
	    icon:        'LM_Sauna_Player.png',
	    latlng:      [-10,132],
	    image:       'preview_canalSauna.jpg',
	    description: 'Player\'s own <b>Sauna</b> adjacent as an extention to the Tenement<br>' +
		'<br><i><a href="https://stalburg.net/Canal_Sauna">See on the wiki</a></i>' 
	},
	{
	    id:          'toilets_01',
	    name:        'Bucket Toilet',
	    icon:        'LM_Toilet.png',
	    latlng:      [-14,136],
	    image:       'preview_Toilet01.jpg',
	    description: '<i><a href="https://stalburg.net/Toilets">See on the wiki</a></i>' 
	},
	{
	    id:          'toilets_02',
	    name:        'Toilet',
	    icon:        'LM_Toilet.png',
	    latlng:      [-50,97],
	    image:       'preview_Toilet02.jpg',
	    description: '<i><a href="https://stalburg.net/Toilets">See on the wiki</a></i>' 
	},
	{
	    id:          'toilets_03',
	    name:        'Toilet',
	    icon:        'LM_Toilet.png',
	    latlng:      [32,-162],
	    image:       'preview_Toilet03.jpg',
	    description: '<i><a href="https://stalburg.net/Toilets">See on the wiki</a></i>' 
	},
	{
	    id:     'deekula_a',
	    name:   'Deekula A',
	    icon:   'LM_Tenement_A.png',
	    latlng: [10,12],
	    sublocs: [
	        {
	            name:        '"Tenement Contract Work!"',
	            icon:        'LM_Renovation.png',
	            image:       'preview_dekA_Renovator.jpg',
	            description: 'Low level tenement contract business on the first floor operated by Samuel Jonasson<br>' +
				'<br>Opening hours:<br>open 24/7<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Tenement_Contract_Work!">See on the wiki</a></i>'
	        },
	        {
	            name:        'Dr. Pena MD',
	            icon:        'LM_Skeida.png',
	            image:       'preview_dekA_Doctor.jpg',
	            description: 'Local doctor on the second floor who can check state of your physical or mental health' +
				'<br>Opening hours:<br>open 24/7<br>' +
				'<br><i><a href="https://stalburg.net/Dr._Pena_MD">See on the wiki</a></i>'
	        },
	        {
	            name:        'Aleksi Kivi',
	            icon:        'LM_NPC.png',
	            image:       'preview_rent_Aleksi.jpg',
	            description: 'A resident needing an apartment to live found on the fifth floor<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Aleksi_Kivi">See on the wiki</a></i>'
	        },
	        {
	            name:        'Osmo Olut vending machine',
	            icon:        'LM_Vending.png',
	            image:       'preview_dekA_Vending.jpg',
	            description: 'Vending machine on the first floor selling Osmo Olut beer<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Osmo_Olut">See on the wiki</a></i>'
	        }
	    ] 
	},
	{
	    id:     'deekula_b',
	    name:   'Deekula B',
	    icon:   'LM_Tenement_B.png',
	    latlng: [-33,7],
	    sublocs: [
	        {
	            name:        'Amanda Korhonen',
	            icon:        'LM_NPC.png',
	            image:       'preview_rent_Amanda.jpg',
	            description: 'A resident needing an apartment to live found on the first floor<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Amanda_Korhonen">See on the wiki</a></i>'
	        }
	    ] 
	},
	{
	    id:     'deekula_c',
	    name:   'Deekula C',
	    icon:   'LM_Tenement_C.png',
	    latlng: [-62,2],
	    sublocs: [
	        {
	            name:        '"Möbelmann Furnitures"',
	            icon:        'LM_Market.png',
	            image:       'preview_Mobelmann.jpg',
	            description: 'Furniture store on the first floor operated by Hank Möbelmann<br>' +
				'<table class="hours_table">' +
				'<tr><td colspan="2">Opening hours:</td></tr>' +
				'<tr><th>Monday</th><td>08:00 - 18:00</td></tr>' +
				'<tr><th>Tuesday</th><td>08:00 - 18:00</td></tr>' +
				'<tr><th>Wednesday</th><td>08:00 - 18:00</td></tr>' +
				'<tr><th>Thursday</th><td>08:00 - 18:00</td></tr>' +
				'<tr><th>Friday</th><td>08:00 - 18:00</td></tr>' +
				'<tr><th>Saturday</th><td>08:00 - 18:00</td></tr>' +
				'<tr><th>Sunday</th><td>08:00 - 18:00</td></tr>' +
				'</table>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#M%C3%B6belmann_Furnitures">See on the wiki</a></i>'
	        },
	        {
	            name:        'Svamppatrullen Mushroom Seller',
	            icon:        'LM_Market.png',
	            image:       'preview_svamppatrullen.jpg',
	            description: 'Mushroom seller accessible from the third floor, operated by Svamppatrullen gang\'s Julius &U+00D6berg<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Svamppatrullen_Mushroom_Seller">See on the wiki</a></i>'
	        },
	        {
	            name:        'Vivi Bondar',
	            icon:        'LM_NPC.png',
	            image:       'preview_rent_Vivi.jpg',
	            description: 'A resident needing an apartment to live found on the first floor<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Vivi_Bondar">See on the wiki</a></i>'
	        },
	        {
	            name:        '"Ducks! Ducks! Ducks!" vending machine',
	            icon:        'LM_Vending.png',
	            image:       'preview_ducks_Vending.jpg',
	            description: 'Vending machine on the first floor selling rubber ducks<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Ducks!_Ducks!_Ducks!">See on the wiki</a></i>'
	        },
	        {
	            name:        '"Cheap Rats for sale" vending machine',
	            icon:        'LM_Vending.png',
	            image:       'preview_rats_Vending.jpg',
	            description: 'Vending machine on the first floor insid storage 11, selling rats<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Cheap_Rats_for_sale">See on the wiki</a></i>'
	        },
	        {
	            name:        'Shrooms vending machine',
	            icon:        'LM_Vending.png',
	            image:       'preview_shrooms_dekC.jpg',
	            description: 'Vending machine on the second floor selling green mushrooms<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Shrooms">See on the wiki</a></i>'
	        }
	    ] 
	},
	{
	    id:          'vending_drinks',
	    name:        'Moca-cola vending machine',
	    icon:        'LM_Vending.png',
	    latlng:      [-60,-29],
	    image:       'preview_border_Vending.jpg',
	    description: 'Vending machine selling soft drinks<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Soft_Drinks">See on the wiki</a></i>' 
	},
	{
	    id:          'vending_drinks',
	    name:        'Osmo Olut vending machine',
	    icon:        'LM_Vending.png',
	    latlng:      [-13,-100],
	    image:       'preview_marketvending.jpg',
	    description: 'Vending machine selling Osmo Olut beer<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Osmo_Olut">See on the wiki</a></i>' 
	},
	{
	    id:          'vending_drinks',
	    name:        'Shroom vending machine',
	    icon:        'LM_Vending.png',
	    latlng:      [-27,-132],
	    image:       'preview_alley_Vending.jpg',
	    description: 'Vending machine selling soft drinks<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Shrooms">See on the wiki</a></i>' 
	},
	{
	    id:     'stalls_hardware',
	    name:   '"Hardware" stall',
	    icon:   'LM_Stall.png',
	    latlng: [34,-73],
	    image:       'preview_stalls_hardware.jpg',
	    description: '<b>"Hardware" stall</b> operated Henning Torskvaer, sells hardware, utility and building materials<br><br>' +
		'<table class="hours_table">' +
		'<tr><td colspan="2">Opening hours:</td></tr>' +
		'<tr><th>Monday</th><td>12:00 - 16:00</td></tr>' +
		'<tr><th>Tuesday</th><td>12:00 - 18:00</td></tr>' +
		'<tr><th>Wednesday</th><td>10:00 - 17:00</td></tr>' +
		'<tr><th>Thursday</th><td>10:00 - 17:00</td></tr>' +
		'<tr><th>Friday</th><td>closed</td></tr>' +
		'<tr><th>Saturday</th><td>12:00 - 18:00</td></tr>' +
		'<tr><th>Sunday</th><td>12:00 - 16:00</td></tr>' +
		'</table>' +
		'<br><br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#"Hardware"_Stall>See on the wiki</a></i>'
	},
	{
	    id:     'stalls_firewood',
	    name:   '"Firewood" stall',
	    icon:   'LM_Stall.png',
	    latlng: [34,-78],
	    image:       'preview_stalls_firewood.jpg',
	    description: '<b>"Firewood" stall</b> operated Petro Blokuvati, sells firewood<br><br>' +
		'<table class="hours_table">' +
		'<tr><td colspan="2">Opening hours:</td></tr>' +
		'<tr><th>Monday</th><td>06:00 - 17:00</td></tr>' +
		'<tr><th>Tuesday</th><td>06:00 - 17:00</td></tr>' +
		'<tr><th>Wednesday</th><td>06:00 - 17:00</td></tr>' +
		'<tr><th>Thursday</th><td>06:00 - 17:00</td></tr>' +
		'<tr><th>Friday</th><td>06:00 - 17:00</td></tr>' +
		'<tr><th>Saturday</th><td>10:00 - 17:00</td></tr>' +
		'<tr><th>Sunday</th><td>closed</td></tr>' +
		'</table>' +
		'<br><br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#"Firewood"_Stall">See on the wiki</a></i>'
	},
	{
	    id:     'stalls_eija',
	    name:   'Eija\'s Grill',
	    icon:   'LM_Stall.png',
	    latlng: [32,-88],
	    image:       'preview_stalls_eija.jpg',
	    description: '<b>Eija\'s Grill</b> operated Eija Lurppu, sells food and drinks<br><br>' +
		'<table class="hours_table">' +
		'<tr><td colspan="2">Opening hours:</td></tr>' +
		'<tr><th>Monday</th><td>18:00 - 24:00</td></tr>' +
		'<tr><th>Tuesday</th><td>18:00 - 24:00</td></tr>' +
		'<tr><th>Wednesday</th><td>18:00 - 24:00</td></tr>' +
		'<tr><th>Thursday</th><td>18:00 - 24:00</td></tr>' +
		'<tr><th>Friday</th><td>18:00 - 24:00</td></tr>' +
		'<tr><th>Saturday</th><td>18:00 - 24:00</td></tr>' +
		'<tr><th>Sunday</th><td>closed</td></tr>' +
		'</table>' +
		'<br><br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Eija\'s_Grill">See on the wiki</a></i>'
	},
	{
	    id:     'stalls_kurahaara',
	    name:   'Kurahaara Brothers\' stall',
	    icon:   'LM_Stall.png',
	    latlng: [16,-76],
	    image:       'preview_stalls_kurahaara.jpg',
	    description: '<b>Kurahaara Brothers Farming Cooperative\'s Seeds stall</b> operated by Lönkka Kurahaara, sells seeds and vegetables<br><br>' +
		'<table class="hours_table">' +
		'<tr><td colspan="2">Opening hours:</td></tr>' +
		'<tr><th>Monday</th><td>??? - ???</td></tr>' +
		'<tr><th>Tuesday</th><td>??? - ???</td></tr>' +
		'<tr><th>Wednesday</th><td>??? - ???</td></tr>' +
		'<tr><th>Thursday</th><td>??? - ???</td></tr>' +
		'<tr><th>Friday</th><td>??? - ???</td></tr>' +
		'<tr><th>Saturday</th><td>??? - ???</td></tr>' +
		'<tr><th>Sunday</th><td>??? -  ???</td></tr>' +
		'</table>' +
		'<br><br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Kurahaara_Brothers_Farming_Cooperative">See on the wiki</a></i>'
	},
	{
	    id:     'stalls_alco',
	    name:   '"Cold Drinks" stall',
	    icon:   'LM_Stall.png',
	    latlng: [7,-71],
	    image:       'preview_stalls_alco.jpg',
	    description: '<b>"Cold Drinks" stall</b> operated by Teuvo Skogman, sells alcohols<br><br>' +
		'<table class="hours_table">' +
		'<tr><td colspan="2">Opening hours:</td></tr>' +
		'<tr><th>Monday</th><td>10:00 - 19:00</td></tr>' +
		'<tr><th>Tuesday</th><td>10:00 - 19:00</td></tr>' +
		'<tr><th>Wednesday</th><td>10:00 - 19:00</td></tr>' +
		'<tr><th>Thursday</th><td>10:00 - 19:00</td></tr>' +
		'<tr><th>Friday</th><td>12:00 - 20:00</td></tr>' +
		'<tr><th>Saturday</th><td>12:00 - 20:00</td></tr>' +
		'<tr><th>Sunday</th><td>12:00 - 16:00</td></tr>' +
		'</table>' +
		'<br><br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#"Cold_Drinks"_Stall">See on the wiki</a></i>'
	},
	{
	    id:     'stalls_plants',
	    name:   'Decorative Plants \& Pots',
	    icon:   'LM_Stall.png',
	    latlng: [0,-75],
	    image:       'preview_stalls_plants.jpg',
	    description: '<b>Decorative Plants \& Pots</b> operated by Sirkku Maltanen, sells exclusive plants<br><br>' +
		'<table class="hours_table">' +
		'<tr><td colspan="2">Opening hours:</td></tr>' +
		'<tr><th>Monday</th><td>06:00 - 16:00</td></tr>' +
		'<tr><th>Tuesday</th><td>06:00 - 16:00</td></tr>' +
		'<tr><th>Wednesday</th><td>06:00 - 16:00</td></tr>' +
		'<tr><th>Thursday</th><td>06:00 - 16:00</td></tr>' +
		'<tr><th>Friday</th><td>06:00 - 16:00</td></tr>' +
		'<tr><th>Saturday</th><td>10:00 - 16:00</td></tr>' +
		'<tr><th>Sunday</th><td>closed</td></tr>' +
		'</table>' +
		'<br><br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Decorative_Plants_\&_Pots">See on the wiki</a></i>'
	},
	{
	    id:     'stalls_cannedfood',
	    name:   '"Jams \& Canned Food" stall',
	    icon:   'LM_Stall.png',
	    latlng: [-26,-75],
	    image:       'preview_stalls_cannedfood.jpg',
	    description: '<b>"Jams \& Canned Food" stall</b> operated by Kalpana Selma, sells canned food<br><br>' +
		'<table class="hours_table">' +
		'<tr><td colspan="2">Opening hours:</td></tr>' +
		'<tr><th>Monday</th><td>06:00 - 16:00</td></tr>' +
		'<tr><th>Tuesday</th><td>06:00 - 16:00</td></tr>' +
		'<tr><th>Wednesday</th><td>06:00 - 16:00</td></tr>' +
		'<tr><th>Thursday</th><td>06:00 - 16:00</td></tr>' +
		'<tr><th>Friday</th><td>closed</td></tr>' +
		'<tr><th>Saturday</th><td>10:00 - 16:00</td></tr>' +
		'<tr><th>Sunday</th><td>closed</td></tr>' +
		'</table>' +
		'<br><br><i><a href="https://stalburg.net/Obenseuer/Shop_Vendors#"Jams_\&_Canned_Food"_Stall">See on the wiki</a></i>'
	},
	{
	    id:          'border_control',
	    name:        'Border Control',
	    icon:        'LM_Border.png',
	    latlng:      [63,-26],
	    image:       'preview_borderControl.jpg',
	    description: 'Main entrance to Obenseuer\'s Residential district zone<br>' +
		'<br><i><a href="https://stalburg.net/Border_Control">See on the wiki</a></i>' 
	},
	{
	    id:          'passport_control',
	    name:        'Passport Control',
	    icon:        'LM_Border.png',
	    latlng:      [-76,64],
	    image:       'preview_passportControl.jpg',
	    description: 'One of the regulated passages between Residential and Bazaar district zones<br>' +
		'<br><i><a href="https://stalburg.net/Passport_Control">See on the wiki</a></i>' 
	},
	{
	    id:          'gatehouse',
	    name:        'Gatehouse',
	    icon:        'LM_Border.png',
	    latlng:      [-61,-22],
	    sublocs: [
	        {
	            name:        'Passport Control',
	            icon:        'LM_Border.png',
	            image:       'preview_gatehouse.jpg',
	            description: 'One of the regulated passages between Residential and Bazaar district zones<br>' +
				'<br><i><a href="https://stalburg.net/Passport_Control">See on the wiki</a></i>'
	        },
	        {
	            name:        'Jail',
	            icon:        'LM_Jail.png',
	            image:       'preview_jail.jpg',
	            description: '<b>Jail</b> run by the local militia with a guard posted on duty, cells are connected via ventilation tunnels to other places within Residential district zone<br>' +
				'<br><i><a href="https://stalburg.net/Jail">See on the wiki</a></i>'
	        }
	    ] 
	},
	{
	    id:          'omarket',
	    name:        'O-Market',
	    icon:        'LM_Market.png',
	    latlng:      [9,-103],
	    image:       'preview_OMarket.jpg',
	    description: 'An establishment of the <b>O-Market</b> chain of stores operated by Mirjam Freighter, sells alcohol, drinks, utility, food and other useful items<br><br>Has a bottle recycling machine that accept bottles and beer cans in exchange for OCs<br>' +
		'<br>Opening hours:<br>open 24/7<br>' +
		'<br><i><a href="https://stalburg.net/O-Market">See on the wiki</a></i>' 
	},
	{
	    id:          'skeida',
	    name:        'Skeida Pharmacy',
	    icon:        'LM_Skeida.png',
	    latlng:      [-28,-87],
	    image:       'preview_Skeida.jpg',
	    description: 'An establishment of the <b>Skeida Pharmacy</b> chain of drug stores operated by Patrik Axelsson and Mona Hall, sells regular medicine and prescripted one<br>' +
		'<br>Opening hours:<br>open 24/7<br>' +
		'<br><i><a href="https://stalburg.net/Skeida_Pharmacy">See on the wiki</a></i>' 
	},
	{
	    id:          'tenement_A',
	    name:        'Tenement A',
	    icon:        'LM_Tenement_A.png',
	    latlng:      [27,-149],
	    image:       'preview_tenA.jpg',
	    description: 'Inaccessible <b>Tenement A</b><br>' +
		'<br><i><a href="https://stalburg.net/Tenement_A">See on the wiki</a></i>' 
	},
	{
	    id:          'speakeasy',
	    name:        'Tenement A Basement',
	    icon:        'LM_Bar.png',
	    latlng:      [28,-142],
	    sublocs: [
	        {
	            name:        'Speakeasy Bar',
	            icon:        'LM_Bar.png',
	            image:       'preview_Speakeasy.jpg',
	            description: 'Local bar run by Pentti Penttilä, located in Tenement A Basement<br>' +
		'<br><i><a href="https://stalburg.net/Speakeasy">See on the wiki</a></i>'
	        },
	        {
	            name:        'Ville Sköldgangster',
	            icon:        'LM_NPC.png',
	            image:       'preview_rent_Ville.png',
	            description: 'A resident needing an apartment to live found drinking at the Speakeasy bar<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Ville_Sk%C3%B6ldgangster">See on the wiki</a></i>'
	        }
	    ]
	},
	{
	    id:          'tenement_B',
	    name:        'Tenement B',
	    icon:        'LM_Tenement_B.png',
	    latlng:      [-15,-145],
	    sublocs: [
	        {
	            name:        'Passmore',
	            icon:        'LM_OneStopShop.png',
	            image:       'preview_Passmore.jpg',
	            description: 'Local dealer accessible with a secret password<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Passmore">See on the wiki</a></i>'
	        },
	        {
	            name:        'Nordmark Water Services',
	            icon:        'LM_Unknown.png',
	            image:       'preview_Nordmark.jpg',
	            description: 'Office of the local water utility company' +
				'<br><i><a href="https://stalburg.net/Nordmark_Water_Services">See on the wiki</a></i>'
	        },
	        {
	            name:        'Bergmann Water Tunnels',
	            icon:        'LM_Unknown.png',
	            image:       'preview_Bergmann.jpg',
	            description: 'A maze of water and maintanance tunnels connecting various places beneath Residential district zone<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Bergmann_Water_Tunnels">See on the wiki</a></i>'
	        }
	    ] 
	},
	{
	    id:          'kolhola',
	    name:        'Kolhola A',
	    icon:        'LM_Tenement_A.png',
	    latlng:      [-48,-69],
	    sublocs: [
	        {
	            name:        'Hostel Warehom',
	            icon:        'LM_Hostel.png',
	            image:       'preview_Hostel.jpg',
	            description: 'Hostel offering a safe place to sleep the nights<br>' +
				'<br><i><a href="https://stalburg.net/Hostel_Warehom">See on the wiki</a></i>'
	        },
	        {
	            name:        'Money Exchange',
	            icon:        'LM_MoneyExchange.png',
	            image:       'preview_MoneyExchange.jpg',
	            description: 'Local currency exchange cantor, offers exchange between OCs and RMs' +
				'<br><i><a href="https://stalburg.net/Money_Exchange">See on the wiki</a></i>'
	        },
			{
				name:        'Taneli Kurju',
				icon:        'LM_NPC.png',
				image:       'preview_rent_Taneli.jpg',
				description: 'A resident needing an apartment to live found at the Hostel Warehom<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Taneli_Kurju">See on the wiki</a></i>'
			},
			{
				name:        'Kirka and Hall Kääbus',
				icon:        'LM_NPC.png',
				image:       'preview_rent_Kirka.jpg',
				description: 'A couple needing an apartment to live found at the Hostel Warehom<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Kirka_and_Hall_K%C3%A4%C3%A4bus">See on the wiki</a></i>'
			},
			{
				name:        'Fenella Hunt and Moray Larson',
				icon:        'LM_NPC.png',
				image:       'preview_rent_Fenella.jpg',
				description: 'A couple needing an apartment to live found at the OS Telemarketing Company<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Fenella_Hunt_and_Moray_Larson">See on the wiki</a></i>'
			}
	    ] 
	},
	{
	    id:          'redemption_militia',
	    name:        'Redemption Militia',
	    icon:        'LM_Militia.png',
	    latlng:      [-60,-47],
	    image:       'preview_militia.jpg',
	    description: 'Religious aid organisation running a <b>"Preach, Prayers and Pea soup"</b> post, offers hot pea soup and accepts donations<br>' +
		'<br><i><a href="https://stalburg.net/Redemption_Militia">See on the wiki</a></i>' 
	},
	{
	    id:          'atm',
	    name:        'ATM booth',
	    icon:        'LM_ATM.png',
	    latlng:      [-27,-102],
	    image:       'preview_ATM.jpg',
	    description: 'An automatic teller machine inside a guarded booth, services <b>Stalburg Bank</b> customers<br>' +
		'<br><i><a href="https://stalburg.net/ATM">See on the wiki</a></i>' 
	},
	{
	    id:          'payphone',
	    name:        'Payphone booth',
	    icon:        'LM_Phone.png',
	    latlng:      [4,-88],
	    image:       'preview_payphone.jpg',
	    description: 'A public <b>payphone</b> that allows to make connections to anywhere in the Stalburg for only 3 RMs per call<br>' +
		'<br><i><a href="https://stalburg.net/Phone#Payphone">See on the wiki</a></i>' 
	},
	{
	    id:          'mailbox',
	    name:        'Mailbox',
	    icon:        'LM_Post.png',
	    latlng:      [-28,-93],
	    image:       'preview_Mailbox.jpg',
	    description: 'A public <b>Mailbox</b> to send your letters<br>' +
		'<br><i><a href="https://stalburg.net/Mail#Mailbox">See on the wiki</a></i>' 
	},
	{
	    id:          'kurahaara_house',
	    name:        'Kurahaara Brothers\' House',
	    icon:        'LM_Unknown.png',
	    latlng:      [-25,-118],
	    image:       'preview_kurahaara_house.jpg',
	    description: 'A house where brothers Jomppe, Lönkka and Simppa Kurahaara live' +
		'<br><i><a href="https://stalburg.net/Kurahaara_House">See on the wiki</a></i>' 
	},
	{
	    id:          'kurahaara_storage',
	    name:        'Greenhouse Storage',
	    icon:        'LM_Unknown.png',
	    latlng:      [12,-122],
	    image:       'preview_kurahaara_storage.jpg',
	    description: 'A small storage adjacent to the greenhouse' +
		'<br><i><a href="https://stalburg.net/Greenhouse_Storage">See on the wiki</a></i>' 
	},
	{
	    id:          'kurahaara_greenhouse',
	    name:        'Greenhouse',
	    icon:        'LM_Farm.png',
	    latlng:      [5,-109],
	    image:       'preview_kurahaara_greenhouse.jpg',
	    description: 'A large <b>Greenhouse</b> built on the roof of O-Market, operated by Jompe Kurahaara' +
		'<br><i><a href="https://stalburg.net/Greenhouse">See on the wiki</a></i>' 
	},
	{
	    id:          'leon_borg',
	    name:        'Leon Borg',
	    icon:        'LM_NPC.png',
	    latlng:      [-8,-144],
	    image:       'preview_rent_Leon.jpg',
	    description: 'A resident needing an apartment to live found beneath a staircase to the Kurahaara\'s Greenhouse<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Leon_Borg">See on the wiki</a></i>'
	},
	{
	    id:          'pera_harju',
	    name:        'Pera Harju',
	    icon:        'LM_NPC.png',
	    latlng:      [18,-102],
	    image:       'preview_rent_Pera.jpg',
	    description: 'A resident needing an apartment to live found on a bench in front of the O-Market<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Pera_Harju">See on the wiki</a></i>'
	},
	{
	    id:          'pate_rantanen',
	    name:        'Pate Rantanen',
	    icon:        'LM_NPC.png',
	    latlng:      [-12,-85],
	    image:       'preview_rent_Pate.jpg',
	    description: 'A resident needing an apartment to live found near a stove on a Market Square<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Pate_Rantanen">See on the wiki</a></i>'
	},
	{
	    id:          'olle_leino',
	    name:        'Olle Leino',
	    icon:        'LM_NPC.png',
	    latlng:      [-13,-89],
	    image:       'preview_rent_Olle.jpg',
	    description: 'A resident needing an apartment to live found near a stove on a Market Square<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Olle_Leino">See on the wiki</a></i>'
	},
	{
	    id:          'nina_lund',
	    name:        'Nina Lund',
	    icon:        'LM_NPC.png',
	    latlng:      [-51,-52],
	    image:       'preview_rent_Nina.jpg',
	    description: 'A resident needing an apartment to live found at the Redemption Militia\'s dining porch<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Nina_Lund">See on the wiki</a></i>'
	},
	{
	    id:          'jesper_kumpula',
	    name:        'Jesper Kumpula',
	    icon:        'LM_NPC.png',
	    latlng:      [-55,-48],
	    image:       'preview_rent_Jesper.jpg',
	    description: 'A resident needing an apartment to live found at the Redemption Militia\'s dining porch<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Jesper_Kumpula">See on the wiki</a></i>'
	},
	{
	    id:          'caravan',
	    name:        'Caravan',
	    icon:        'LM_Unknown.png',
	    latlng:      [-46,-19],
	    image:       'preview_caravan.jpg',
	    description: 'A parked <b>Caravan</b> in front of Deekula C entrance<br>' +
		'<br><i><a href="https://stalburg.net/Caravan">See on the wiki</a></i>'
	},
	{
	    id:          'ingrid_claesson',
	    name:        'Ingrid Claesson',
	    icon:        'LM_NPC.png',
	    latlng:      [-35,-30],
	    image:       'preview_rent_Ingrid.jpg',
	    description: 'A resident needing an apartment to live found at the Trade Road campsite<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Ingrid_Claesson">See on the wiki</a></i>'
	},
	{
	    id:          'jarmo_pettinen',
	    name:        'Jarmo Pettinen',
	    icon:        'LM_NPC.png',
	    latlng:      [-14,-33],
	    image:       'preview_rent_Jermo.jpg',
	    description: 'A resident needing an apartment to live found at the Trade Road campsite<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Jarmo_Pettinen">See on the wiki</a></i>'
	},
	{
	    id:          'agnes_ulrik',
	    name:        'Agnes and Ulrik Takala',
	    icon:        'LM_NPC.png',
	    latlng:      [-1,-37],
	    image:       'preview_rent_Agnes.jpg',
	    description: 'A couple needing an apartment to live found at the Trade Road campsite<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Agnes_and_Ulrik_Takala">See on the wiki</a></i>'
	},
	{
	    id:          'martta_lapinjoki',
	    name:        'Martta Lapinjoki and Jaska Virtanen',
	    icon:        'LM_NPC.png',
	    latlng:      [-71,108],
	    image:       'preview_rent_Martta.jpg',
	    description: 'A couple needing an apartment to live found at the campsite near Lot Shacks<br>' +
		'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Martta_Lapinjoki_and_Jaska_Virtanen">See on the wiki</a></i>'
	},
	{
	    id:          'toll_bridge',
	    name:        'Toll Bridge',
	    icon:        'LM_Unknown.png',
	    latlng:      [33,38],
	    image:       'preview_TollBridge.jpg',
	    description: 'A wooden bridge built by David Lund to toll people crossing the canal to get to the Other Side<br>' +
		'<br><i><a href="https://stalburg.net/Toll_Bridge">See on the wiki</a></i>'
	},
	{
	    id:          'container_bridge',
	    name:        'Container Bridge',
	    icon:        'LM_Unknown.png',
	    latlng:      [-74,43],
	    image:       'preview_ContainerBridge.jpg',
	    description: 'A bridge made out of reused container office with a locked doors<br>' +
		'<br><i><a href="https://stalburg.net/Container_Bridge">See on the wiki</a></i>'
	},
	{
	    id:          'duck_house',
	    name:        'Mr. Duck\'s Home',
	    icon:        'LM_Unknown.png',
	    latlng:      [-76,51],
	    image:       'preview_duckHouse.jpg',
	    description: 'A little home with a lot of creppy rubber ducks around<br>' +
		'<br><i><a href="https://stalburg.net/Mr._Duck\'s_Home">See on the wiki</a></i>'
	},
	{
	    id:          'container_shack',
	    name:        'Container shack',
	    icon:        'LM_Unknown.png',
	    latlng:      [-77,116],
	    image:       'preview_ContainerShack.jpg',
	    description: 'A shack made out of container<br>' +
		'<br><i><a href="https://stalburg.net/Container_shack">See on the wiki</a></i>'
	},
	{
	    id:          'wooden_shack',
	    name:        'Wooden shack',
	    icon:        'LM_Unknown.png',
	    latlng:      [-70,114],
	    image:       'preview_WoodenShack.jpg',
	    description: 'A small <b>Wooden shack</b><br>' +
		'<br><i><a href="https://stalburg.net/Wooden_shack">See on the wiki</a></i>'
	},
	{
	    id:          'yellow_shack',
	    name:        'Yellow shack',
	    icon:        'LM_Unknown.png',
	    latlng:      [-62,120],
	    image:       'preview_YellowShack.jpg',
	    description: 'A shack with a balcony<br>' +
		'<br><i><a href="https://stalburg.net/Yellow_shack">See on the wiki</a></i>'
	},
	{
	    id:          'bus',
	    name:        'Bus',
	    icon:        'LM_Bus.png',
	    latlng:      [6,-61],
	    sublocs: [
	        {
	            name:        'Sara Claine',
	            icon:        'LM_NPC.png',
				image:       'preview_rent_Sara.jpg',
				description: 'A resident needing an apartment to live found in the decommissioned bus<br>' +
				'<br><i><a href="https://stalburg.net/Obenseuer/Characters#Sara_Claine">See on the wiki</a></i>'
			}
	    ] 
	},
	{
	    id:          'resource_wood01',
	    name:        'Tree Debris',
	    icon:        'LM_Wooddebris.png',
	    latlng:      [-62*0.58,45*1.098],
	    image:       'preview_trees.png',
	    description: 'A pile of <b>Tree Debris</b> harvestable with an axe<br>' +
		'<br><i><a href="https://stalburg.net/Tree_Chopping">See on the wiki</a></i>'
	},
	{
	    id:          'resource_wood02',
	    name:        'Tree Debris',
	    icon:        'LM_Wooddebris.png',
	    latlng:      [-65*0.58,116*1.098],
	    image:       'preview_trees2.png',
	    description: 'A pile of <b>Tree Debris</b> harvestable with an axe<br>' +
		'<br><i><a href="https://stalburg.net/Tree_Chopping">See on the wiki</a></i>'
	},
	{
	    id:          'resource_wood03',
	    name:        'Tree Debris',
	    icon:        'LM_Wooddebris.png',
	    latlng:      [-38*0.58,23*1.098],
	    image:       'preview_trees3.png',
	    description: 'A pile of <b>Tree Debris</b> harvestable with an axe<br>' +
		'<br><i><a href="https://stalburg.net/Tree_Chopping">See on the wiki</a></i>'
	},
	{
	    id:          'resource_wood04',
	    name:        'Tree Debris',
	    icon:        'LM_Wooddebris.png',
	    latlng:      [-35*0.58,-13*1.098],
	    image:       'preview_trees4.png',
	    description: 'A pile of <b>Tree Debris</b> harvestable with an axe<br>' +
		'<br><i><a href="https://stalburg.net/Tree_Chopping">See on the wiki</a></i>'
	},
	{
	    id:          'resource_rock',
	    name:        'Rock Pile',
	    icon:        'LM_Rockdebris.png',
	    latlng:      [-70*0.58,87*1.098],
	    image:       'preview_rocks.png',
	    description: 'A pile of rocks harvestable with an pickaxe<br>' +
		'<br><i><a href="https://stalburg.net/Rock_Mining">See on the wiki</a></i>'
	}
];
