#!/usr/bin/perl -w

use strict;
use LWP::Simple;
use Data::Dumper;

my $content = get('http://www.travelex.co.uk/uk/personal/rateslist.aspx');

my @rows = $content =~ m/Buy now.*?(<tr.*?<\/tr>)/gis;

my $rates = {};

for my $row (@rows) {
    my ($link) = $row =~ m/(<a id="ContentPageInterior1_.*?<\/a>)/is;
    next unless $link;

    my ($currency, $rate) = $link =~ m/Param1="(.*?)" Param2="(.*?)"/is;
    my ($name, $country) = split /-/, $currency;

    $rates->{$name} = $rate;
}

my $json = join ",\n", map { '  "' . $_ . '": ' . $rates->{$_} . '' } keys %$rates;

#print "Content-type: application/json\n\n";
print join "\n" , '{', $json, '}';

