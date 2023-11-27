//walter_tower = new L.marker([0,0], { opacity: 0.9 })
//.bindPopup('<h2>Walter Tower</h2><img width="200" height="200" src="res/locations/walter.jpg">Headquoters of <a href="https://stalburg.net/Walter_Corporation">Walter Corporation</a>, a company created by <a href="https://stalburg.net/Jeff_Walter">Jeff Walter</a>.<br><span class="location-section">Maps:</span> <a href="https://stalburg.net/Skyscraper">skyscraper</a>',{offset: [0,-12],maxWidth:400,minWidth:400,className:'location',closeButton:false})
//.addTo(locations).on('click',function(){setHash("walter_tower")});

var objects = [
	{
	    id:     'One_Stop_Shop',
	    name:   'One Stop Shop',
	    icon:   'LM_OneStopShop.png',
	    latlng: [-76,90],
	    image:       'https://stalburg.net/images/4/46/Shops_general.jpg',
	    description: '<b>One Stop Shop</b> is selling and buying random junk<br><br>Opening hours:<br><b>Monday</b> 08:00-18:00<br><b>Tuesday</b> 08:00-18:00<br>Wednesday</b> 08:00-18:00<br><b>Thursday</b> 08:00-18:00<br><b>Friday</b> 08:00-18:00<br><b>Saturday</b> 10:00-16:00<br><b>Sunday</b> closed<br><br><a href="https://stalburg.net/Obenseuer/Shop_Vendors#One_Stop_Shop">See on the wiki</a>'
	},
	{
	    id:     'players_tenement',
	    name:   'Player\'s Tenement',
	    icon:   'LM_Bar.png',
	    latlng: [-14,100],
	    image:       'preview_playerment.jpg',
	    description: 'It\'s a 6 story building with additional basement and a roof space, owned by the Player' + 
	    			 '<br><br><a href="https://stalburg.net/Player\'s_Tenement">See on the wiki</a>'
	},
	{
	    id:          'canal_sauna',
	    name:        'Canal Sauna',
	    icon:        'LM_Bar.png',
	    latlng:      [-10,132],
	    image:       'preview_canalSauna.jpg',
	    description: 'Player\'s own <b>Sauna<b> adjacent as an extention to the Tenement<br><br><a href="https://stalburg.net/Canal_Sauna">See on the wiki</a>' 
	},
	{
	    id:          'toilets_01',
	    name:        'Bucket Toilet',
	    icon:        'LM_Toilet.png',
	    latlng:      [-14,136],
	    image:       'preview_Toilet01.jpg',
	    description: '<a href="https://stalburg.net/Toilets">See on the wiki</a>' 
	},
	{
	    id:          'toilets_02',
	    name:        'Toilet',
	    icon:        'LM_Toilet.png',
	    latlng:      [-50,97],
	    image:       'preview_Toilet02.jpg',
	    description: '<a href="https://stalburg.net/Toilets">See on the wiki</a>' 
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
	            description: 'Low level tenement contract business on the first floor operated by Samuel Jonasson<br><br><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Tenement_Contract_Work!">See on the wiki</a>'
	        },
	        {
	            name:        'Dr. Pena MD',
	            icon:        'LM_Skeida.png',
	            image:       'preview_dekA_Doctor.jpg',
	            description: 'Local doctor on the second floor who can check state of your physical or mental health'
	        },
	        {
	            name:        'Osmo Olut vending machine',
	            icon:        'LM_Vending.png',
	            image:       'preview_dekA_Vending.jpg',
	            description: 'Vending machine on the first floor selling Osmo Olut beer<br><br><a href="https://stalburg.net/Obenseuer/Shop_Vendors#Osmo_Olut">See on the wiki</a>'
	        }
	    ] 
	}
];